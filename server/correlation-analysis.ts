/**
 * Correlation Analysis Module for MindSense
 * Calculates correlations between biomarkers and mood scores
 */

export type CorrelationData = {
  biomarkerType: string;
  moodMetric: string;
  coefficient: number; // Pearson correlation coefficient (-1 to 1)
  pValue: number; // Statistical significance
  sampleSize: number;
  strength: "strong" | "moderate" | "weak" | "none";
  direction: "positive" | "negative" | "none";
};

export type CorrelationMatrix = {
  labels: string[];
  data: number[][]; // 2D array of correlation coefficients
  metadata: {
    biomarkers: string[];
    moodMetrics: string[];
    sampleSize: number;
    dateRange: { start: Date; end: Date };
  };
};

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * Calculate p-value for correlation (simplified approximation)
 */
function calculatePValue(r: number, n: number): number {
  if (n < 3) {
    return 1;
  }

  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const df = n - 2;

  // Simplified p-value approximation using t-distribution
  // For production, use a proper statistical library
  const pValue = 2 * (1 - normalCDF(Math.abs(t)));
  return Math.min(Math.max(pValue, 0), 1);
}

/**
 * Normal cumulative distribution function (approximation)
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const probability =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - probability : probability;
}

/**
 * Determine correlation strength
 */
function getCorrelationStrength(r: number): "strong" | "moderate" | "weak" | "none" {
  const absR = Math.abs(r);
  if (absR >= 0.7) return "strong";
  if (absR >= 0.4) return "moderate";
  if (absR >= 0.2) return "weak";
  return "none";
}

/**
 * Determine correlation direction
 */
function getCorrelationDirection(r: number): "positive" | "negative" | "none" {
  if (r > 0.1) return "positive";
  if (r < -0.1) return "negative";
  return "none";
}

/**
 * Calculate correlation between a biomarker and mood metric
 */
export function calculateBiomarkerMoodCorrelation(
  biomarkerValues: number[],
  moodValues: number[],
  biomarkerType: string,
  moodMetric: string
): CorrelationData {
  // Ensure arrays are the same length
  const minLength = Math.min(biomarkerValues.length, moodValues.length);
  const x = biomarkerValues.slice(0, minLength);
  const y = moodValues.slice(0, minLength);

  const coefficient = calculatePearsonCorrelation(x, y);
  const pValue = calculatePValue(coefficient, minLength);

  return {
    biomarkerType,
    moodMetric,
    coefficient,
    pValue,
    sampleSize: minLength,
    strength: getCorrelationStrength(coefficient),
    direction: getCorrelationDirection(coefficient),
  };
}

/**
 * Generate correlation matrix for all biomarkers and mood metrics
 */
export function generateCorrelationMatrix(
  biomarkerData: Array<{ biomarkerType: string; value: number; date: Date }>,
  moodData: Array<{ moodScore: number; anxietyScore?: number; stressScore?: number; date: Date }>,
  dateRange: { start: Date; end: Date }
): CorrelationMatrix {
  // Group biomarker data by type
  const biomarkersByType = new Map<string, Array<{ value: number; date: Date }>>();
  biomarkerData.forEach((reading) => {
    if (!biomarkersByType.has(reading.biomarkerType)) {
      biomarkersByType.set(reading.biomarkerType, []);
    }
    biomarkersByType.get(reading.biomarkerType)!.push({
      value: reading.value,
      date: reading.date,
    });
  });

  // Prepare mood metrics
  const moodMetrics = ["moodScore", "anxietyScore", "stressScore"];
  const biomarkerTypes = Array.from(biomarkersByType.keys());

  // Create labels for the matrix
  const labels = [...biomarkerTypes, ...moodMetrics];

  // Initialize correlation matrix
  const size = labels.length;
  const data: number[][] = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0));

  // Calculate correlations
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j) {
        data[i][j] = 1; // Perfect correlation with self
        continue;
      }

      // Get data arrays for correlation
      const isBiomarkerI = i < biomarkerTypes.length;
      const isBiomarkerJ = j < biomarkerTypes.length;

      let xValues: number[] = [];
      let yValues: number[] = [];

      if (isBiomarkerI && isBiomarkerJ) {
        // Biomarker vs Biomarker
        const biomarkerI = biomarkersByType.get(biomarkerTypes[i]) || [];
        const biomarkerJ = biomarkersByType.get(biomarkerTypes[j]) || [];

        // Align by date
        const dateMap = new Map<string, { x?: number; y?: number }>();
        biomarkerI.forEach((b) => {
          const dateKey = b.date.toISOString().split("T")[0];
          if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
          dateMap.get(dateKey)!.x = b.value;
        });
        biomarkerJ.forEach((b) => {
          const dateKey = b.date.toISOString().split("T")[0];
          if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
          dateMap.get(dateKey)!.y = b.value;
        });

        dateMap.forEach((values) => {
          if (values.x !== undefined && values.y !== undefined) {
            xValues.push(values.x);
            yValues.push(values.y);
          }
        });
      } else if (isBiomarkerI && !isBiomarkerJ) {
        // Biomarker vs Mood
        const biomarker = biomarkersByType.get(biomarkerTypes[i]) || [];
        const moodMetric = moodMetrics[j - biomarkerTypes.length];

        // Align by date
        const dateMap = new Map<string, { x?: number; y?: number }>();
        biomarker.forEach((b) => {
          const dateKey = b.date.toISOString().split("T")[0];
          if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
          dateMap.get(dateKey)!.x = b.value;
        });
        moodData.forEach((m) => {
          const dateKey = m.date.toISOString().split("T")[0];
          if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
          const moodValue =
            moodMetric === "moodScore"
              ? m.moodScore
              : moodMetric === "anxietyScore"
              ? m.anxietyScore
              : m.stressScore;
          if (moodValue !== undefined) {
            dateMap.get(dateKey)!.y = moodValue;
          }
        });

        dateMap.forEach((values) => {
          if (values.x !== undefined && values.y !== undefined) {
            xValues.push(values.x);
            yValues.push(values.y);
          }
        });
      } else if (!isBiomarkerI && isBiomarkerJ) {
        // Mood vs Biomarker (symmetric)
        const moodMetric = moodMetrics[i - biomarkerTypes.length];
        const biomarker = biomarkersByType.get(biomarkerTypes[j]) || [];

        // Align by date
        const dateMap = new Map<string, { x?: number; y?: number }>();
        moodData.forEach((m) => {
          const dateKey = m.date.toISOString().split("T")[0];
          if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
          const moodValue =
            moodMetric === "moodScore"
              ? m.moodScore
              : moodMetric === "anxietyScore"
              ? m.anxietyScore
              : m.stressScore;
          if (moodValue !== undefined) {
            dateMap.get(dateKey)!.x = moodValue;
          }
        });
        biomarker.forEach((b) => {
          const dateKey = b.date.toISOString().split("T")[0];
          if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
          dateMap.get(dateKey)!.y = b.value;
        });

        dateMap.forEach((values) => {
          if (values.x !== undefined && values.y !== undefined) {
            xValues.push(values.x);
            yValues.push(values.y);
          }
        });
      } else {
        // Mood vs Mood
        const moodMetricI = moodMetrics[i - biomarkerTypes.length];
        const moodMetricJ = moodMetrics[j - biomarkerTypes.length];

        moodData.forEach((m) => {
          const valueI =
            moodMetricI === "moodScore"
              ? m.moodScore
              : moodMetricI === "anxietyScore"
              ? m.anxietyScore
              : m.stressScore;
          const valueJ =
            moodMetricJ === "moodScore"
              ? m.moodScore
              : moodMetricJ === "anxietyScore"
              ? m.anxietyScore
              : m.stressScore;

          if (valueI !== undefined && valueJ !== undefined) {
            xValues.push(valueI);
            yValues.push(valueJ);
          }
        });
      }

      // Calculate correlation
      if (xValues.length > 2) {
        data[i][j] = calculatePearsonCorrelation(xValues, yValues);
      }
    }
  }

  return {
    labels,
    data,
    metadata: {
      biomarkers: biomarkerTypes,
      moodMetrics,
      sampleSize: moodData.length,
      dateRange,
    },
  };
}

/**
 * Find significant correlations
 */
export function findSignificantCorrelations(
  correlations: CorrelationData[],
  significanceLevel: number = 0.05
): CorrelationData[] {
  return correlations
    .filter((c) => c.pValue < significanceLevel && Math.abs(c.coefficient) > 0.2)
    .sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
}
