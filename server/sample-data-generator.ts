/**
 * Sample Data Generator for Demo Mode
 * Generates realistic health data for demonstration purposes
 */

import type { User } from "../drizzle/schema";

export type SampleDataOptions = {
  daysOfHistory: number; // Number of days of historical data to generate
  includePatterns: boolean; // Include realistic patterns (e.g., declining mood, rising biomarkers)
};

const BIOMARKER_TYPES = ["CRP", "IL6", "LEPTIN", "PROINSULIN", "BDNF"] as const;

// Normal ranges for each biomarker
const BIOMARKER_RANGES = {
  CRP: { min: 0.5, max: 3.0, unit: "mg/L", critical: 10.0 },
  IL6: { min: 1.0, max: 5.0, unit: "pg/mL", critical: 15.0 },
  LEPTIN: { min: 2.0, max: 10.0, unit: "ng/mL", critical: 30.0 },
  PROINSULIN: { min: 2.0, max: 8.0, unit: "pmol/L", critical: 20.0 },
  BDNF: { min: 15.0, max: 30.0, unit: "ng/mL", critical: 10.0 }, // Lower is worse for BDNF
};

/**
 * Generate random value within range with optional trend
 */
function generateValue(
  min: number,
  max: number,
  trend: number = 0,
  noise: number = 0.2
): number {
  const base = min + (max - min) * (0.5 + trend * 0.3);
  const variation = (max - min) * noise * (Math.random() - 0.5);
  return Math.max(min, Math.min(max, base + variation));
}

/**
 * Generate biomarker readings
 */
export function generateBiomarkerReadings(
  userId: number,
  options: SampleDataOptions
) {
  const readings = [];
  const now = new Date();
  
  // Create a trend pattern (0 = stable, 1 = worsening, -1 = improving)
  const overallTrend = options.includePatterns ? Math.random() * 0.5 : 0;

  for (let day = 0; day < options.daysOfHistory; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Progress through the trend
    const trendProgress = day / options.daysOfHistory;
    const currentTrend = overallTrend * trendProgress;

    for (const biomarkerType of BIOMARKER_TYPES) {
      const range = BIOMARKER_RANGES[biomarkerType];
      
      // BDNF trend is inverted (lower is worse)
      const adjustedTrend = biomarkerType === "BDNF" ? -currentTrend : currentTrend;
      
      const value = generateValue(range.min, range.max, adjustedTrend);

      readings.push({
        userId,
        biomarkerType,
        value: value.toFixed(2), // Convert to string for decimal field
        unit: range.unit,
        measuredAt: date,
        deviceId: null,
        source: "demo" as const,
        qualityScore: null,
      });
    }
  }

  return readings;
}

/**
 * Generate mood assessments
 */
export function generateMoodAssessments(
  userId: number,
  options: SampleDataOptions
) {
  const assessments = [];
  const now = new Date();
  
  // Create mood trend (declining if patterns enabled)
  const moodTrend = options.includePatterns ? -0.3 : 0;

  for (let day = 0; day < options.daysOfHistory; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    const trendProgress = day / options.daysOfHistory;
    const currentTrend = moodTrend * trendProgress;

    // Generate 1-2 assessments per day
    const assessmentsPerDay = Math.random() > 0.5 ? 2 : 1;
    
    for (let i = 0; i < assessmentsPerDay; i++) {
      const assessmentDate = new Date(date);
      assessmentDate.setHours(8 + i * 12, Math.floor(Math.random() * 60));

      const moodScore = Math.round(generateValue(3, 9, currentTrend, 0.3));
      const anxietyScore = Math.round(generateValue(2, 8, -currentTrend, 0.3));
      const stressScore = Math.round(generateValue(2, 8, -currentTrend, 0.3));

      assessments.push({
        userId,
        assessmentType: "mood" as const,
        mood: null,
        moodScore,
        totalScore: moodScore,
        responses: JSON.stringify({
          anxiety: anxietyScore,
          stress: stressScore,
          energy: Math.round(generateValue(3, 9, currentTrend, 0.3)),
          sleep: Math.round(generateValue(4, 9, currentTrend, 0.3)),
        }),
        assessmentDate,
        notes: null,
      });
    }
  }

  return assessments;
}

/**
 * Generate journal entries
 */
export function generateJournalEntries(userId: number, options: SampleDataOptions) {
  const entries = [];
  const now = new Date();

  const sampleEntries = [
    "Feeling good today. Had a productive morning and got some exercise.",
    "Struggled with focus today. Might need to adjust my sleep schedule.",
    "Great therapy session. Working through some challenging emotions.",
    "Noticed increased anxiety this week. Will discuss with my doctor.",
    "Feeling more balanced. The medication adjustment seems to be helping.",
    "Had a tough day but managed to practice mindfulness techniques.",
    "Energy levels improving. Regular exercise is making a difference.",
    "Experiencing some side effects from new medication. Monitoring closely.",
    "Grateful for my support system. Family check-in was helpful.",
    "Mood has been stable. Sticking to my routine is paying off.",
  ];

  // Generate 1 entry every 2-3 days
  for (let day = 0; day < options.daysOfHistory; day += Math.floor(Math.random() * 2) + 2) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(20, Math.floor(Math.random() * 60));

    const content = sampleEntries[Math.floor(Math.random() * sampleEntries.length)];

    entries.push({
      userId,
      entryType: "mood" as const,
      entryDate: date,
      title: "Daily Mood Check-in",
      description: content,
      severity: Math.round(Math.random() * 4) + 5, // 5-9 (mood scale)
      tags: null,
    });
  }

  return entries;
}

/**
 * Generate medications
 */
export function generateMedications(userId: number) {
  const medications = [
    {
      name: "Sertraline",
      dosage: "50mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Sarah Johnson",
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      notes: "SSRI for depression and anxiety",
    },
    {
      name: "Omega-3",
      dosage: "1000mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Sarah Johnson",
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      notes: "Supplement for mood support",
    },
    {
      name: "Vitamin D",
      dosage: "2000 IU",
      frequency: "Once daily",
      prescribedBy: "Dr. Sarah Johnson",
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      notes: "Deficiency correction",
    },
  ];

  return medications.map((med) => ({
    userId,
    ...med,
    endDate: null,
    isActive: true,
    reminderEnabled: false,
    reminderTimes: null,
    sideEffects: null,
  }));
}

/**
 * Generate appointments
 */
export function generateAppointments(userId: number) {
  const now = new Date();
  const appointments = [];

  // Past appointments
  const pastAppointments = [
    {
      daysAgo: 30,
      title: "Psychiatry Follow-up",
      description: "Medication review and adjustment",
      providerName: "Dr. Sarah Johnson",
      appointmentType: "psychiatrist" as const,
      location: "Mental Health Clinic",
      notes: "Discussed medication efficacy and side effects",
    },
    {
      daysAgo: 14,
      title: "Therapy Session",
      description: "Cognitive Behavioral Therapy",
      providerName: "Dr. Michael Chen",
      appointmentType: "therapist" as const,
      location: "Wellness Center",
      notes: "CBT session - coping strategies for anxiety",
    },
  ];

  for (const apt of pastAppointments) {
    const date = new Date(now);
    date.setDate(date.getDate() - apt.daysAgo);
    date.setHours(10, 0, 0, 0);

    appointments.push({
      userId,
      title: apt.title,
      description: apt.description,
      appointmentType: apt.appointmentType,
      appointmentDate: date,
      location: apt.location,
      providerName: apt.providerName,
      reminderSent: true,
      reminderDays: 1,
      reportGenerated: false,
      reportGeneratedAt: null,
      status: "completed" as const,
      notes: apt.notes,
    });
  }

  // Upcoming appointments
  const upcomingAppointments = [
    {
      daysAhead: 7,
      title: "Psychiatry Check-in",
      description: "Monthly medication review",
      providerName: "Dr. Sarah Johnson",
      appointmentType: "psychiatrist" as const,
      location: "Mental Health Clinic",
      notes: "Review current medication regimen",
    },
    {
      daysAhead: 14,
      title: "Therapy Session",
      description: "Ongoing CBT treatment",
      providerName: "Dr. Michael Chen",
      appointmentType: "therapist" as const,
      location: "Wellness Center",
      notes: "Continue working on stress management techniques",
    },
  ];

  for (const apt of upcomingAppointments) {
    const date = new Date(now);
    date.setDate(date.getDate() + apt.daysAhead);
    date.setHours(14, 0, 0, 0);

    appointments.push({
      userId,
      title: apt.title,
      description: apt.description,
      appointmentType: apt.appointmentType,
      appointmentDate: date,
      location: apt.location,
      providerName: apt.providerName,
      reminderSent: false,
      reminderDays: 1,
      reportGenerated: false,
      reportGeneratedAt: null,
      status: "scheduled" as const,
      notes: apt.notes,
    });
  }

  return appointments;
}

/**
 * Generate care team members
 */
export function generateCareTeam(userId: number) {
  const careTeam = [
    {
      name: "Dr. Sarah Johnson",
      providerRole: "psychiatrist" as const,
      specialty: "Adult Psychiatry",
      phone: "(555) 123-4567",
      email: "sjohnson@mentalhealth.example.com",
      organization: "Mental Health Clinic",
      address: "123 Health St, Suite 200, Medical District",
    },
    {
      name: "Dr. Michael Chen",
      providerRole: "therapist" as const,
      specialty: "Cognitive Behavioral Therapy",
      phone: "(555) 234-5678",
      email: "mchen@wellness.example.com",
      organization: "Wellness Center",
      address: "456 Wellness Ave, Downtown",
    },
    {
      name: "Dr. Emily Rodriguez",
      providerRole: "other" as const,
      specialty: "Family Medicine",
      phone: "(555) 345-6789",
      email: "erodriguez@primarycare.example.com",
      organization: "Primary Care Associates",
      address: "789 Care Blvd, Medical Plaza",
    },
  ];

  return careTeam.map((member) => ({
    userId,
    ...member,
    notes: null,
    sharingPreferences: JSON.stringify({ trends: true, journal: true, insights: true }),
    lastContactDate: null,
  }));
}

/**
 * Generate complete sample dataset
 */
export async function generateSampleData(
  userId: number,
  options: SampleDataOptions = { daysOfHistory: 30, includePatterns: true }
) {
  return {
    biomarkerReadings: generateBiomarkerReadings(userId, options),
    moodAssessments: generateMoodAssessments(userId, options),
    journalEntries: generateJournalEntries(userId, options),
    medications: generateMedications(userId),
    appointments: generateAppointments(userId),
    careTeam: generateCareTeam(userId),
  };
}
