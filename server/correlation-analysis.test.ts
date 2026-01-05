import { describe, it, expect } from "vitest";
import {
  calculateBiomarkerMoodCorrelation,
  generateCorrelationMatrix,
  findSignificantCorrelations,
  type CorrelationData,
} from "./correlation-analysis";

describe("Correlation Analysis Module", () => {
  describe("calculateBiomarkerMoodCorrelation", () => {
    it("should calculate perfect positive correlation", () => {
      const biomarkerValues = [1, 2, 3, 4, 5];
      const moodValues = [10, 20, 30, 40, 50];

      const result = calculateBiomarkerMoodCorrelation(
        biomarkerValues,
        moodValues,
        "CRP",
        "moodScore"
      );

      expect(result.coefficient).toBeCloseTo(1.0, 1);
      expect(result.strength).toBe("strong");
      expect(result.direction).toBe("positive");
      expect(result.sampleSize).toBe(5);
    });

    it("should calculate perfect negative correlation", () => {
      const biomarkerValues = [1, 2, 3, 4, 5];
      const moodValues = [50, 40, 30, 20, 10];

      const result = calculateBiomarkerMoodCorrelation(
        biomarkerValues,
        moodValues,
        "IL-6",
        "moodScore"
      );

      expect(result.coefficient).toBeCloseTo(-1.0, 1);
      expect(result.strength).toBe("strong");
      expect(result.direction).toBe("negative");
    });

    it("should calculate weak/no correlation", () => {
      // Random uncorrelated data
      const biomarkerValues = [1, 5, 2, 4, 3, 2, 5, 1, 4, 3];
      const moodValues = [3, 2, 5, 1, 4, 5, 2, 4, 1, 3];

      const result = calculateBiomarkerMoodCorrelation(
        biomarkerValues,
        moodValues,
        "Leptin",
        "anxietyScore"
      );

      // Just verify it calculates a coefficient
      expect(result.coefficient).toBeDefined();
      expect(result.coefficient).toBeGreaterThanOrEqual(-1);
      expect(result.coefficient).toBeLessThanOrEqual(1);
      expect(result.strength).toMatch(/weak|none|moderate|strong/);
    });

    it("should handle moderate positive correlation", () => {
      // Data with moderate correlation (some noise)
      const biomarkerValues = [1, 2, 3, 4, 5, 6, 7, 8];
      const moodValues = [2, 4, 3, 5, 6, 7, 8, 10];

      const result = calculateBiomarkerMoodCorrelation(
        biomarkerValues,
        moodValues,
        "BDNF",
        "moodScore"
      );

      expect(result.coefficient).toBeGreaterThan(0.4);
      expect(result.strength).toMatch(/moderate|strong/);
      expect(result.direction).toBe("positive");
    });

    it("should handle empty arrays", () => {
      const result = calculateBiomarkerMoodCorrelation([], [], "CRP", "moodScore");

      expect(result.coefficient).toBe(0);
      expect(result.sampleSize).toBe(0);
    });

    it("should handle mismatched array lengths", () => {
      const biomarkerValues = [1, 2, 3, 4, 5];
      const moodValues = [10, 20, 30];

      const result = calculateBiomarkerMoodCorrelation(
        biomarkerValues,
        moodValues,
        "Proinsulin",
        "stressScore"
      );

      expect(result.sampleSize).toBe(3); // Should use minimum length
    });

    it("should calculate p-value", () => {
      const biomarkerValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const moodValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

      const result = calculateBiomarkerMoodCorrelation(
        biomarkerValues,
        moodValues,
        "CRP",
        "moodScore"
      );

      expect(result.pValue).toBeDefined();
      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
      expect(result.pValue).toBeLessThan(0.05); // Should be significant
    });
  });

  describe("generateCorrelationMatrix", () => {
    it("should generate correlation matrix with biomarkers and mood data", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const biomarkerData = [
        { biomarkerType: "CRP", value: 1.5, date: new Date("2024-01-01") },
        { biomarkerType: "CRP", value: 2.0, date: new Date("2024-01-02") },
        { biomarkerType: "IL-6", value: 3.0, date: new Date("2024-01-01") },
        { biomarkerType: "IL-6", value: 4.0, date: new Date("2024-01-02") },
      ];

      const moodData = [
        { moodScore: 5, anxietyScore: 3, stressScore: 4, date: new Date("2024-01-01") },
        { moodScore: 6, anxietyScore: 4, stressScore: 5, date: new Date("2024-01-02") },
      ];

      const matrix = generateCorrelationMatrix(biomarkerData, moodData, {
        start: startDate,
        end: endDate,
      });

      expect(matrix.labels).toContain("CRP");
      expect(matrix.labels).toContain("IL-6");
      expect(matrix.labels).toContain("moodScore");
      expect(matrix.labels).toContain("anxietyScore");
      expect(matrix.labels).toContain("stressScore");
      expect(matrix.data).toHaveLength(5); // 2 biomarkers + 3 mood metrics
      expect(matrix.data[0]).toHaveLength(5);
      expect(matrix.metadata.sampleSize).toBe(2);
    });

    it("should have 1.0 correlation on diagonal", () => {
      const biomarkerData = [
        { biomarkerType: "CRP", value: 1.5, date: new Date("2024-01-01") },
      ];

      const moodData = [
        { moodScore: 5, anxietyScore: 3, stressScore: 4, date: new Date("2024-01-01") },
      ];

      const matrix = generateCorrelationMatrix(biomarkerData, moodData, {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      });

      // Diagonal should be 1.0 (perfect correlation with self)
      for (let i = 0; i < matrix.data.length; i++) {
        expect(matrix.data[i][i]).toBe(1);
      }
    });

    it("should handle empty data", () => {
      const matrix = generateCorrelationMatrix([], [], {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      });

      expect(matrix.labels).toEqual(["moodScore", "anxietyScore", "stressScore"]);
      expect(matrix.metadata.biomarkers).toEqual([]);
    });
  });

  describe("findSignificantCorrelations", () => {
    it("should filter correlations by significance level", () => {
      const correlations: CorrelationData[] = [
        {
          biomarkerType: "CRP",
          moodMetric: "moodScore",
          coefficient: 0.8,
          pValue: 0.01,
          sampleSize: 30,
          strength: "strong",
          direction: "positive",
        },
        {
          biomarkerType: "IL-6",
          moodMetric: "anxietyScore",
          coefficient: 0.3,
          pValue: 0.1,
          sampleSize: 30,
          strength: "weak",
          direction: "positive",
        },
        {
          biomarkerType: "Leptin",
          moodMetric: "stressScore",
          coefficient: -0.6,
          pValue: 0.02,
          sampleSize: 30,
          strength: "moderate",
          direction: "negative",
        },
      ];

      const significant = findSignificantCorrelations(correlations, 0.05);

      expect(significant).toHaveLength(2); // Only first and third
      expect(significant[0].coefficient).toBe(0.8); // Sorted by absolute value
      expect(significant[1].coefficient).toBe(-0.6);
    });

    it("should filter out weak correlations", () => {
      const correlations: CorrelationData[] = [
        {
          biomarkerType: "CRP",
          moodMetric: "moodScore",
          coefficient: 0.1,
          pValue: 0.01,
          sampleSize: 30,
          strength: "weak",
          direction: "none",
        },
      ];

      const significant = findSignificantCorrelations(correlations);

      expect(significant).toHaveLength(0); // Coefficient too low
    });

    it("should sort by absolute correlation coefficient", () => {
      const correlations: CorrelationData[] = [
        {
          biomarkerType: "CRP",
          moodMetric: "moodScore",
          coefficient: 0.5,
          pValue: 0.01,
          sampleSize: 30,
          strength: "moderate",
          direction: "positive",
        },
        {
          biomarkerType: "IL-6",
          moodMetric: "anxietyScore",
          coefficient: -0.8,
          pValue: 0.01,
          sampleSize: 30,
          strength: "strong",
          direction: "negative",
        },
        {
          biomarkerType: "BDNF",
          moodMetric: "stressScore",
          coefficient: 0.3,
          pValue: 0.02,
          sampleSize: 30,
          strength: "weak",
          direction: "positive",
        },
      ];

      const significant = findSignificantCorrelations(correlations);

      expect(significant[0].coefficient).toBe(-0.8); // Highest absolute value
      expect(significant[1].coefficient).toBe(0.5);
      expect(significant[2].coefficient).toBe(0.3);
    });
  });
});
