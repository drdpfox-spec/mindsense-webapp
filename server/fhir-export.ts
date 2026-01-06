/**
 * FHIR R4 Export Service
 * Generates FHIR-compliant resources for EHR system integration
 * Supports: Epic, Cerner, Allscripts, and other FHIR-compatible systems
 */

import type { User } from "../drizzle/schema";
import * as db from "./db";

/**
 * FHIR R4 Resource Types
 */
export type FHIRPatient = {
  resourceType: "Patient";
  id: string;
  identifier: Array<{
    system: string;
    value: string;
  }>;
  name: Array<{
    use: string;
    text: string;
  }>;
  telecom?: Array<{
    system: string;
    value: string;
    use: string;
  }>;
  gender?: string;
  birthDate?: string;
};

export type FHIRObservation = {
  resourceType: "Observation";
  id: string;
  status: "final" | "preliminary" | "registered";
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
};

export type FHIRCondition = {
  resourceType: "Condition";
  id: string;
  clinicalStatus: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  verificationStatus: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  recordedDate: string;
};

export type FHIRMedicationStatement = {
  resourceType: "MedicationStatement";
  id: string;
  status: "active" | "completed" | "entered-in-error" | "intended" | "stopped" | "on-hold";
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  effectivePeriod?: {
    start: string;
    end?: string;
  };
  dosage?: Array<{
    text: string;
    timing?: {
      repeat: {
        frequency: number;
        period: number;
        periodUnit: string;
      };
    };
  }>;
};

export type FHIRAppointment = {
  resourceType: "Appointment";
  id: string;
  status: "proposed" | "pending" | "booked" | "arrived" | "fulfilled" | "cancelled" | "noshow";
  serviceType?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  appointmentType?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  description?: string;
  start: string;
  end?: string;
  participant: Array<{
    actor: {
      reference: string;
      display?: string;
    };
    status: "accepted" | "declined" | "tentative" | "needs-action";
  }>;
};

export type FHIRBundle = {
  resourceType: "Bundle";
  type: "collection" | "document" | "transaction";
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: FHIRPatient | FHIRObservation | FHIRCondition | FHIRMedicationStatement | FHIRAppointment;
  }>;
};

/**
 * LOINC codes for biomarkers
 */
const BIOMARKER_LOINC_CODES = {
  CRP: { code: "1988-5", display: "C-Reactive Protein" },
  "IL-6": { code: "26881-3", display: "Interleukin 6" },
  Leptin: { code: "25000-7", display: "Leptin" },
  Proinsulin: { code: "20448-7", display: "Proinsulin" },
  BDNF: { code: "99999-1", display: "Brain-Derived Neurotrophic Factor" }, // Custom code
};

/**
 * Generate FHIR Patient resource
 */
export function generateFHIRPatient(user: User): FHIRPatient {
  return {
    resourceType: "Patient",
    id: `patient-${user.id}`,
    identifier: [
      {
        system: "https://mindsense.app/patient-id",
        value: user.id.toString(),
      },
    ],
    name: [
      {
        use: "official",
        text: user.name || "Unknown",
      },
    ],
    telecom: user.email
      ? [
          {
            system: "email",
            value: user.email,
            use: "home",
          },
        ]
      : undefined,
  };
}

/**
 * Generate FHIR Observation resources for biomarkers
 */
export async function generateFHIRBiomarkerObservations(
  userId: number
): Promise<FHIRObservation[]> {
  const readings = await db.getBiomarkerReadings(
    userId,
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
    new Date()
  );

  return readings.map((reading, index) => {
    const loincCode = BIOMARKER_LOINC_CODES[reading.biomarkerType as keyof typeof BIOMARKER_LOINC_CODES];

    return {
      resourceType: "Observation",
      id: `observation-${reading.id}`,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "laboratory",
              display: "Laboratory",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: loincCode?.code || "unknown",
            display: loincCode?.display || reading.biomarkerType,
          },
        ],
        text: loincCode?.display || reading.biomarkerType,
      },
      subject: {
        reference: `Patient/patient-${userId}`,
      },
      effectiveDateTime: new Date(reading.measuredAt).toISOString(),
      valueQuantity: {
        value: parseFloat(reading.value), // Convert decimal string to number for FHIR
        unit: reading.unit,
        system: "http://unitsofmeasure.org",
        code: reading.unit,
      },
    };
  });
}

/**
 * Generate FHIR MedicationStatement resources
 */
export async function generateFHIRMedicationStatements(
  userId: number
): Promise<FHIRMedicationStatement[]> {
  const medications = await db.getMedications(userId);

  return medications.map((med) => ({
    resourceType: "MedicationStatement",
    id: `medication-${med.id}`,
    status: med.isActive ? "active" : "completed",
    medicationCodeableConcept: {
      coding: [
        {
          system: "http://www.nlm.nih.gov/research/umls/rxnorm",
          code: "unknown", // Would need RxNorm API integration
          display: med.name,
        },
      ],
      text: med.name,
    },
    subject: {
      reference: `Patient/patient-${userId}`,
    },
    effectivePeriod: {
      start: new Date(med.startDate).toISOString(),
      end: med.endDate ? new Date(med.endDate).toISOString() : undefined,
    },
    dosage: [
      {
        text: `${med.dosage} ${med.frequency}`,
      },
    ],
  }));
}

/**
 * Generate FHIR Appointment resources
 */
export async function generateFHIRAppointments(userId: number): Promise<FHIRAppointment[]> {
  const appointments = await db.getAppointments(userId);

  return appointments.map((apt) => ({
    resourceType: "Appointment",
    id: `appointment-${apt.id}`,
    status: apt.status === "scheduled" ? "booked" : apt.status === "completed" ? "fulfilled" : "cancelled",
    description: apt.notes || undefined,
    start: new Date(apt.appointmentDate).toISOString(),
    participant: [
      {
        actor: {
          reference: `Patient/patient-${userId}`,
        },
        status: "accepted",
      },
      {
        actor: {
          reference: `Practitioner/${(apt.providerName || 'unknown').replace(/\s+/g, "-").toLowerCase()}`,
          display: apt.providerName || 'Unknown Provider',
        },
        status: "accepted",
      },
    ],
  }));
}

/**
 * Generate complete FHIR Bundle for export
 */
export async function generateFHIRBundle(userId: number): Promise<FHIRBundle> {
  const user = await db.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const patient = generateFHIRPatient(user);
  const observations = await generateFHIRBiomarkerObservations(userId);
  const medications = await generateFHIRMedicationStatements(userId);
  const appointments = await generateFHIRAppointments(userId);

  const bundle: FHIRBundle = {
    resourceType: "Bundle",
    type: "collection",
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `https://mindsense.app/fhir/Patient/${patient.id}`,
        resource: patient,
      },
      ...observations.map((obs) => ({
        fullUrl: `https://mindsense.app/fhir/Observation/${obs.id}`,
        resource: obs,
      })),
      ...medications.map((med) => ({
        fullUrl: `https://mindsense.app/fhir/MedicationStatement/${med.id}`,
        resource: med,
      })),
      ...appointments.map((apt) => ({
        fullUrl: `https://mindsense.app/fhir/Appointment/${apt.id}`,
        resource: apt,
      })),
    ],
  };

  return bundle;
}
