/**
 * 5 Validated Biomarkers for Mental Health Relapse Prediction
 * Complementary biomarkers capture inflammation, metabolic dysregulation, neurotrophic signaling, and stress response.
 */

export const BIOMARKERS = {
  CRP: {
    id: "CRP",
    name: "CRP",
    fullName: "C-Reactive Protein",
    unit: "mg/L",
    color: "#00CED1", // Cyan
    normalRange: { min: 0, max: 3 },
    description: "Systemic inflammation marker elevated during acute psychotic episodes",
    clinicalRole: "Inflammatory activation",
    clinicalContext: "Schizophrenia, schizoaffective disorder",
    relapseDetection: {
      auc: "0.72–0.81",
      sensitivity: "68% (>3 mg/L threshold)",
    },
  },
  IL6: {
    id: "IL6",
    name: "IL-6",
    fullName: "Interleukin-6",
    unit: "pg/mL",
    color: "#4169E1", // Royal Blue
    normalRange: { min: 0, max: 5 },
    description: "Pro-inflammatory cytokine correlating with symptom severity and treatment resistance",
    clinicalRole: "Cytokine signaling",
    clinicalContext: "Treatment-resistant schizophrenia",
    relapseDetection: {
      auc: "0.76",
      specificity: "82% (>5 pg/mL)",
    },
  },
  LEPTIN: {
    id: "LEPTIN",
    name: "Leptin",
    fullName: "Leptin",
    unit: "ng/mL",
    color: "#9370DB", // Medium Purple
    normalRange: { min: 2, max: 15 },
    description: "Adipokine regulating metabolism and immune function, dysregulated in psychosis",
    clinicalRole: "Metabolic dysfunction",
    clinicalContext: "Antipsychotic metabolic side effects",
    relapseDetection: {
      diagnosticAccuracy: "74% sensitivity",
      specificity: "79% for metabolic risk",
    },
  },
  PROINSULIN: {
    id: "PROINSULIN",
    name: "Proinsulin",
    fullName: "Proinsulin",
    unit: "pmol/L",
    color: "#FF6347", // Tomato
    normalRange: { min: 2, max: 20 },
    description: "Precursor to insulin, elevated in schizophrenia indicating β-cell dysfunction",
    clinicalRole: "Insulin resistance",
    clinicalContext: "Metabolic syndrome monitoring",
    relapseDetection: {
      metabolicRisk: "71% accuracy",
      sensitivity: "65% for diabetes risk",
    },
  },
  BDNF: {
    id: "BDNF",
    name: "BDNF",
    fullName: "Brain-Derived Neurotrophic Factor",
    unit: "ng/mL",
    color: "#32CD32", // Lime Green
    normalRange: { min: 10, max: 40 },
    description: "Neurotrophic factor supporting neuroplasticity, reduced in schizophrenia",
    clinicalRole: "Neurotrophic signaling",
    clinicalContext: "Cognitive decline, negative symptoms",
    relapseDetection: {
      diagnosticAccuracy: "AUC 0.68–0.74",
      sensitivity: "62–70%",
    },
  },
} as const;

export const BIOMARKER_LIST = Object.values(BIOMARKERS);

export type BiomarkerId = keyof typeof BIOMARKERS;

export function getBiomarker(id: string) {
  return BIOMARKERS[id.toUpperCase() as BiomarkerId];
}

export function getRiskLevel(biomarkerId: string, value: number): "low" | "medium" | "high" {
  const biomarker = getBiomarker(biomarkerId);
  if (!biomarker) return "low";

  const { min, max } = biomarker.normalRange;
  const range = max - min;

  if (value < min || value > max) {
    // Outside normal range
    const deviation = value < min ? min - value : value - max;
    const percentDeviation = (deviation / range) * 100;

    if (percentDeviation > 50) return "high";
    if (percentDeviation > 20) return "medium";
  }

  return "low";
}

export function formatBiomarkerValue(biomarkerId: string, value: number): string {
  const biomarker = getBiomarker(biomarkerId);
  if (!biomarker) return value.toFixed(1);

  return `${value.toFixed(1)} ${biomarker.unit}`;
}
