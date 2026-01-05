/**
 * AI Insights Engine for MindSense
 * Pattern detection, relapse risk calculation, and automated insight generation
 */

import { BIOMARKER_LIST } from "../shared/biomarkers";

export type BiomarkerReading = {
  biomarkerType: string;
  value: number;
  readingDate: Date;
};

export type MoodAssessment = {
  assessmentType: string;
  moodScore: number | null;
  totalScore: number | null;
  assessmentDate: Date;
};

export type InsightType = "warning" | "positive" | "neutral" | "critical";

export type Insight = {
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-100
  biomarkersInvolved: string[];
  recommendations: string[];
  relapseRisk?: number; // 0-100
};

/**
 * Calculate relapse risk score based on biomarker readings and mood assessments
 */
export function calculateRelapseRisk(
  biomarkerReadings: BiomarkerReading[],
  moodAssessments: MoodAssessment[]
): number {
  let riskScore = 0;
  let factorCount = 0;

  // Analyze each biomarker
  for (const biomarker of BIOMARKER_LIST) {
    const readings = biomarkerReadings
      .filter((r) => r.biomarkerType === biomarker.id)
      .sort((a, b) => b.readingDate.getTime() - a.readingDate.getTime())
      .slice(0, 7); // Last 7 readings

    if (readings.length < 3) continue;

    const latestValue = readings[0].value;
    const { min, max } = biomarker.normalRange;

    // Check if outside normal range
    if (latestValue < min || latestValue > max) {
      const deviation = latestValue < min ? (min - latestValue) / min : (latestValue - max) / max;
      riskScore += Math.min(deviation * 30, 30); // Max 30 points per biomarker
      factorCount++;
    }

    // Check for rapid increase trend
    if (readings.length >= 3) {
      const trend = (readings[0].value - readings[2].value) / readings[2].value;
      if (trend > 0.15) {
        // 15% increase
        riskScore += 15;
        factorCount++;
      }
    }
  }

  // Analyze mood assessments
  const recentMoods = moodAssessments
    .filter((m) => m.moodScore !== null)
    .sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())
    .slice(0, 7);

  if (recentMoods.length >= 3) {
    const avgMood = recentMoods.reduce((sum, m) => sum + (m.moodScore || 0), 0) / recentMoods.length;
    if (avgMood < 4) {
      // Low mood (1-3 scale)
      riskScore += (4 - avgMood) * 10;
      factorCount++;
    }

    // Check for declining mood trend
    if (recentMoods.length >= 3) {
      const recentAvg = (recentMoods[0].moodScore! + recentMoods[1].moodScore!) / 2;
      const olderAvg = (recentMoods[recentMoods.length - 2].moodScore! + recentMoods[recentMoods.length - 1].moodScore!) / 2;
      if (recentAvg < olderAvg - 1) {
        riskScore += 15;
        factorCount++;
      }
    }
  }

  // Normalize to 0-100 scale
  return factorCount > 0 ? Math.min(Math.round(riskScore), 100) : 0;
}

/**
 * Detect patterns in biomarker data
 */
export function detectBiomarkerPatterns(biomarkerReadings: BiomarkerReading[]): Insight[] {
  const insights: Insight[] = [];

  for (const biomarker of BIOMARKER_LIST) {
    const readings = biomarkerReadings
      .filter((r) => r.biomarkerType === biomarker.id)
      .sort((a, b) => b.readingDate.getTime() - a.readingDate.getTime());

    if (readings.length < 3) continue;

    const latestValue = readings[0].value;
    const { min, max } = biomarker.normalRange;

    // Pattern 1: Elevated levels
    if (latestValue > max) {
      const severity = ((latestValue - max) / max) * 100;
      insights.push({
        type: severity > 50 ? "critical" : "warning",
        title: `Elevated ${biomarker.name} Levels`,
        description: `Your ${biomarker.fullName} level is ${latestValue.toFixed(1)} ${biomarker.unit}, which is above the normal range (${min}-${max} ${biomarker.unit}).`,
        confidence: Math.min(70 + severity / 2, 95),
        biomarkersInvolved: [biomarker.id],
        recommendations: [
          `Consult with your healthcare provider about elevated ${biomarker.name}`,
          "Monitor stress levels and practice relaxation techniques",
          "Ensure adequate sleep and maintain regular sleep schedule",
        ],
      });
    }

    // Pattern 2: Rapid increase
    if (readings.length >= 3) {
      const change = ((readings[0].value - readings[2].value) / readings[2].value) * 100;
      if (change > 20) {
        insights.push({
          type: "warning",
          title: `Rapid ${biomarker.name} Increase`,
          description: `Your ${biomarker.name} has increased by ${change.toFixed(1)}% over the past few days.`,
          confidence: 75,
          biomarkersInvolved: [biomarker.id],
          recommendations: [
            "Schedule a check-in with your mental health provider",
            "Review recent stressors or lifestyle changes",
            "Consider increasing self-care activities",
          ],
        });
      }
    }

    // Pattern 3: Stable and normal
    if (readings.length >= 5) {
      const allNormal = readings.slice(0, 5).every((r) => r.value >= min && r.value <= max);
      const variance = Math.max(...readings.slice(0, 5).map((r) => r.value)) - Math.min(...readings.slice(0, 5).map((r) => r.value));
      const avgValue = readings.slice(0, 5).reduce((sum, r) => sum + r.value, 0) / 5;
      
      if (allNormal && variance < (max - min) * 0.3) {
        insights.push({
          type: "positive",
          title: `Stable ${biomarker.name} Levels`,
          description: `Your ${biomarker.name} has remained stable and within normal range (${avgValue.toFixed(1)} ${biomarker.unit}).`,
          confidence: 85,
          biomarkersInvolved: [biomarker.id],
          recommendations: [
            "Continue your current wellness routine",
            "Maintain consistent sleep and exercise patterns",
          ],
        });
      }
    }
  }

  return insights;
}

/**
 * Detect correlations between biomarkers
 */
export function detectBiomarkerCorrelations(biomarkerReadings: BiomarkerReading[]): Insight[] {
  const insights: Insight[] = [];

  // Check CRP and IL-6 correlation (both inflammation markers)
  const crpReadings = biomarkerReadings.filter((r) => r.biomarkerType === "CRP").slice(0, 7);
  const il6Readings = biomarkerReadings.filter((r) => r.biomarkerType === "IL6").slice(0, 7);

  if (crpReadings.length >= 3 && il6Readings.length >= 3) {
    const crpElevated = crpReadings.some((r) => r.value > 3);
    const il6Elevated = il6Readings.some((r) => r.value > 5);

    if (crpElevated && il6Elevated) {
      insights.push({
        type: "warning",
        title: "Elevated Inflammation Markers",
        description: "Both CRP and IL-6 show elevated levels, indicating systemic inflammation which may increase relapse risk.",
        confidence: 82,
        biomarkersInvolved: ["CRP", "IL6"],
        recommendations: [
          "Discuss anti-inflammatory strategies with your provider",
          "Consider dietary changes to reduce inflammation",
          "Ensure adequate rest and stress management",
        ],
      });
    }
  }

  // Check Leptin and Proinsulin correlation (metabolic markers)
  const leptinReadings = biomarkerReadings.filter((r) => r.biomarkerType === "LEPTIN").slice(0, 7);
  const proinsulinReadings = biomarkerReadings.filter((r) => r.biomarkerType === "PROINSULIN").slice(0, 7);

  if (leptinReadings.length >= 3 && proinsulinReadings.length >= 3) {
    const leptinHigh = leptinReadings.some((r) => r.value > 15);
    const proinsulinHigh = proinsulinReadings.some((r) => r.value > 15);

    if (leptinHigh && proinsulinHigh) {
      insights.push({
        type: "warning",
        title: "Metabolic Dysregulation Detected",
        description: "Elevated Leptin and Proinsulin suggest metabolic dysfunction, which can affect mental health stability.",
        confidence: 78,
        biomarkersInvolved: ["LEPTIN", "PROINSULIN"],
        recommendations: [
          "Review diet and exercise routine with healthcare provider",
          "Consider metabolic screening tests",
          "Monitor blood sugar levels if diabetic",
        ],
      });
    }
  }

  return insights;
}

/**
 * Analyze mood trends
 */
export function analyzeMoodTrends(moodAssessments: MoodAssessment[]): Insight[] {
  const insights: Insight[] = [];

  const recentMoods = moodAssessments
    .filter((m) => m.moodScore !== null)
    .sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())
    .slice(0, 14);

  if (recentMoods.length < 5) return insights;

  // Calculate average mood
  const avgMood = recentMoods.reduce((sum, m) => sum + (m.moodScore || 0), 0) / recentMoods.length;

  // Declining mood trend
  const recentAvg = recentMoods.slice(0, 3).reduce((sum, m) => sum + (m.moodScore || 0), 0) / 3;
  const olderAvg = recentMoods.slice(-3).reduce((sum, m) => sum + (m.moodScore || 0), 0) / 3;

  if (recentAvg < olderAvg - 1) {
    insights.push({
      type: "warning",
      title: "Declining Mood Trend",
      description: `Your mood has been declining over the past two weeks. Recent average: ${recentAvg.toFixed(1)}, Previous average: ${olderAvg.toFixed(1)}.`,
      confidence: 80,
      biomarkersInvolved: [],
      recommendations: [
        "Schedule an appointment with your therapist or psychiatrist",
        "Increase frequency of mood logging to track patterns",
        "Review medication adherence and effectiveness",
        "Engage in activities that previously improved your mood",
      ],
    });
  }

  // Consistently low mood
  if (avgMood < 3 && recentMoods.length >= 7) {
    const lowMoodDays = recentMoods.filter((m) => (m.moodScore || 0) < 3).length;
    if (lowMoodDays >= 5) {
      insights.push({
        type: "critical",
        title: "Persistent Low Mood",
        description: `You've reported low mood on ${lowMoodDays} of the last ${recentMoods.length} days.`,
        confidence: 90,
        biomarkersInvolved: [],
        recommendations: [
          "Contact your mental health provider immediately",
          "Review your safety plan if you have one",
          "Reach out to your support network",
          "Consider crisis resources if needed",
        ],
      });
    }
  }

  // Positive trend
  if (recentAvg > olderAvg + 1 && avgMood > 6) {
    insights.push({
      type: "positive",
      title: "Improving Mood Trend",
      description: `Your mood has been improving! Recent average: ${recentAvg.toFixed(1)}, up from ${olderAvg.toFixed(1)}.`,
      confidence: 85,
      biomarkersInvolved: [],
      recommendations: [
        "Continue your current treatment and self-care routine",
        "Identify what's been helping and maintain those practices",
        "Share this progress with your care team",
      ],
    });
  }

  return insights;
}

/**
 * Generate comprehensive insights
 */
export function generateInsights(
  biomarkerReadings: BiomarkerReading[],
  moodAssessments: MoodAssessment[]
): {
  insights: Insight[];
  relapseRisk: number;
} {
  const insights: Insight[] = [];

  // Calculate relapse risk
  const relapseRisk = calculateRelapseRisk(biomarkerReadings, moodAssessments);

  // Detect patterns
  insights.push(...detectBiomarkerPatterns(biomarkerReadings));
  insights.push(...detectBiomarkerCorrelations(biomarkerReadings));
  insights.push(...analyzeMoodTrends(moodAssessments));

  // Add overall risk assessment
  if (relapseRisk > 70) {
    insights.unshift({
      type: "critical",
      title: "High Relapse Risk Detected",
      description: `Your current relapse risk score is ${relapseRisk}/100. Multiple risk factors have been identified.`,
      confidence: 88,
      biomarkersInvolved: BIOMARKER_LIST.map((b) => b.id),
      recommendations: [
        "Contact your mental health provider as soon as possible",
        "Review and update your relapse prevention plan",
        "Increase monitoring frequency",
        "Ensure medication adherence",
        "Activate your support network",
      ],
      relapseRisk,
    });
  } else if (relapseRisk > 40) {
    insights.unshift({
      type: "warning",
      title: "Moderate Relapse Risk",
      description: `Your relapse risk score is ${relapseRisk}/100. Some risk factors are present.`,
      confidence: 75,
      biomarkersInvolved: BIOMARKER_LIST.map((b) => b.id),
      recommendations: [
        "Schedule a check-in with your care team",
        "Review recent stressors and coping strategies",
        "Maintain consistent self-care routines",
        "Monitor symptoms closely",
      ],
      relapseRisk,
    });
  } else if (relapseRisk < 20 && insights.filter((i) => i.type === "positive").length >= 2) {
    insights.unshift({
      type: "positive",
      title: "Low Relapse Risk - Stable",
      description: `Your relapse risk score is ${relapseRisk}/100. You're maintaining good stability.`,
      confidence: 82,
      biomarkersInvolved: [],
      recommendations: [
        "Continue your current wellness routine",
        "Maintain regular appointments with your care team",
        "Keep tracking your biomarkers and mood",
      ],
      relapseRisk,
    });
  }

  // Sort by priority: critical > warning > neutral > positive
  const priorityOrder = { critical: 0, warning: 1, neutral: 2, positive: 3 };
  insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

  return {
    insights,
    relapseRisk,
  };
}
