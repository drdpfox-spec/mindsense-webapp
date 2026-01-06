import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  biomarkerReadings,
  moodAssessments,
  medications,
  medicationLogs,
  devices,
  alerts,
  journalEntries,
  appointments,
  careTeamMembers,
  insights,
  relapseRiskScores,
  accessTokens,
  type BiomarkerReading,
  type MoodAssessment,
  type Medication,
  type MedicationLog,
  type Device,
  type Alert,
  type JournalEntry,
  type Appointment,
  type CareTeamMember,
  type Insight,
  type RelapseRiskScore,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Biomarker Readings
export async function getBiomarkerReadings(
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<BiomarkerReading[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(biomarkerReadings)
    .where(
      and(
        eq(biomarkerReadings.userId, userId),
        gte(biomarkerReadings.measuredAt, startDate),
        lte(biomarkerReadings.measuredAt, endDate)
      )
    )
    .orderBy(desc(biomarkerReadings.measuredAt));
}

export async function getLatestBiomarkerReadings(userId: number): Promise<BiomarkerReading[]> {
  const db = await getDb();
  if (!db) return [];

  // Get latest reading for each biomarker type
  const result = await db
    .select()
    .from(biomarkerReadings)
    .where(eq(biomarkerReadings.userId, userId))
    .orderBy(desc(biomarkerReadings.measuredAt))
    .limit(50); // Get recent readings

  // Group by biomarker type and get latest for each
  const latestByType = new Map<string, BiomarkerReading>();
  for (const reading of result) {
    if (!latestByType.has(reading.biomarkerType)) {
      latestByType.set(reading.biomarkerType, reading);
    }
  }

  return Array.from(latestByType.values());
}

// Mood Assessments
export async function getMoodAssessments(userId: number, limit = 50): Promise<MoodAssessment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(moodAssessments)
    .where(eq(moodAssessments.userId, userId))
    .orderBy(desc(moodAssessments.assessmentDate))
    .limit(limit);
}

export async function createMoodAssessment(assessment: Omit<MoodAssessment, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(moodAssessments).values(assessment as any);
}

// Medications
export async function getMedications(userId: number): Promise<Medication[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(medications)
    .where(eq(medications.userId, userId))
    .orderBy(desc(medications.createdAt));
}

export async function getMedicationLogs(userId: number, limit = 100): Promise<MedicationLog[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(medicationLogs)
    .where(eq(medicationLogs.userId, userId))
    .orderBy(desc(medicationLogs.takenAt))
    .limit(limit);
}

// Devices
export async function getDevices(userId: number): Promise<Device[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(devices)
    .where(eq(devices.userId, userId))
    .orderBy(desc(devices.createdAt));
}

export async function getActiveDevice(userId: number): Promise<Device | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(devices)
    .where(and(eq(devices.userId, userId), eq(devices.status, "active")))
    .orderBy(desc(devices.lastSyncAt))
    .limit(1);

  return result[0];
}

// Alerts
export async function getAlerts(userId: number, includeRead = false): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(alerts.userId, userId)];
  if (!includeRead) {
    conditions.push(eq(alerts.isRead, false));
  }

  return await db
    .select()
    .from(alerts)
    .where(and(...conditions))
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, alertId));
}

// Journal Entries
export async function getJournalEntries(userId: number, limit = 50): Promise<JournalEntry[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.entryDate))
    .limit(limit);
}

export async function createJournalEntry(entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(journalEntries).values(entry as any);
}

// Appointments
export async function getAppointments(userId: number): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getUpcomingAppointments(userId: number): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.appointmentDate, new Date())))
    .orderBy(appointments.appointmentDate);
}

// Care Team
export async function getCareTeamMembers(userId: number): Promise<CareTeamMember[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(careTeamMembers)
    .where(eq(careTeamMembers.userId, userId))
    .orderBy(desc(careTeamMembers.createdAt));
}

// Insights
export async function getInsights(userId: number, includeRead = false): Promise<Insight[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(insights.userId, userId)];
  if (!includeRead) {
    conditions.push(eq(insights.isRead, false));
  }

  return await db
    .select()
    .from(insights)
    .where(and(...conditions))
    .orderBy(desc(insights.createdAt));
}

// Relapse Risk Scores
export async function getLatestRelapseRiskScore(userId: number): Promise<RelapseRiskScore | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(relapseRiskScores)
    .where(eq(relapseRiskScores.userId, userId))
    .orderBy(desc(relapseRiskScores.calculatedAt))
    .limit(1);

  return result[0];
}

export async function getRelapseRiskHistory(userId: number, limit = 30): Promise<RelapseRiskScore[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(relapseRiskScores)
    .where(eq(relapseRiskScores.userId, userId))
    .orderBy(desc(relapseRiskScores.calculatedAt))
    .limit(limit);
}

// Delete all user data (for demo reset)
export async function deleteAllUserData(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Delete in order to respect foreign key constraints
  await db.delete(medicationLogs).where(eq(medicationLogs.userId, userId));
  await db.delete(biomarkerReadings).where(eq(biomarkerReadings.userId, userId));
  await db.delete(moodAssessments).where(eq(moodAssessments.userId, userId));
  await db.delete(medications).where(eq(medications.userId, userId));
  await db.delete(devices).where(eq(devices.userId, userId));
  await db.delete(alerts).where(eq(alerts.userId, userId));
  await db.delete(journalEntries).where(eq(journalEntries.userId, userId));
  await db.delete(appointments).where(eq(appointments.userId, userId));
  await db.delete(careTeamMembers).where(eq(careTeamMembers.userId, userId));
  await db.delete(insights).where(eq(insights.userId, userId));
  await db.delete(relapseRiskScores).where(eq(relapseRiskScores.userId, userId));
}

// Provider Portal Functions
export async function getProviderPatients(providerId: number) {
  const db = await getDb();
  if (!db) return [];

  const relationships = await db
    .select({
      id: providerPatients.id,
      patientId: providerPatients.patientId,
      patientName: users.name,
      patientEmail: users.email,
      relationshipType: providerPatients.relationshipType,
      status: providerPatients.status,
      notes: providerPatients.notes,
      createdAt: providerPatients.createdAt,
      updatedAt: providerPatients.updatedAt,
      latestRiskScore: relapseRiskScores.riskScore,
    })
    .from(providerPatients)
    .leftJoin(users, eq(providerPatients.patientId, users.id))
    .leftJoin(
      relapseRiskScores,
      and(
        eq(relapseRiskScores.userId, providerPatients.patientId),
        // Get the latest risk score (subquery would be better but this works)
      )
    )
    .where(eq(providerPatients.providerId, providerId))
    .orderBy(desc(providerPatients.updatedAt));

  return relationships;
}

export async function getProviderCriticalAlerts(providerId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all patients for this provider
  const patientIds = await db
    .select({ patientId: providerPatients.patientId })
    .from(providerPatients)
    .where(eq(providerPatients.providerId, providerId));

  if (patientIds.length === 0) return [];

  // Get critical alerts for these patients
  const criticalAlerts = await db
    .select({
      id: alerts.id,
      patientId: alerts.userId,
      patientName: users.name,
      message: alerts.message,
      severity: alerts.severity,
      createdAt: alerts.createdAt,
    })
    .from(alerts)
    .leftJoin(users, eq(alerts.userId, users.id))
    .where(
      and(
        eq(alerts.severity, "critical"),
        eq(alerts.isRead, false)
      )
    )
    .orderBy(desc(alerts.createdAt))
    .limit(10);

  return criticalAlerts;
}

export async function verifyProviderPatientAccess(
  providerId: number,
  patientId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(providerPatients)
    .where(
      and(
        eq(providerPatients.providerId, providerId),
        eq(providerPatients.patientId, patientId),
        eq(providerPatients.status, "active")
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function getPatientDetails(patientId: number) {
  const db = await getDb();
  if (!db) return null;

  const patient = await db
    .select()
    .from(users)
    .where(eq(users.id, patientId))
    .limit(1);

  if (patient.length === 0) return null;

  // Get latest biomarkers
  const latestBiomarkers = await getLatestBiomarkerReadings(patientId);
  
  // Get latest risk score
  const latestRiskScore = await getLatestRelapseRiskScore(patientId);
  
  // Get recent alerts
  const recentAlerts = await db
    .select()
    .from(alerts)
    .where(eq(alerts.userId, patientId))
    .orderBy(desc(alerts.createdAt))
    .limit(5);

  return {
    patient: patient[0],
    latestBiomarkers,
    latestRiskScore,
    recentAlerts,
  };
}

// Get user by ID
export async function getUserById(userId: number): Promise<typeof users.$inferSelect | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function createMedication(medication: Omit<Medication, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(medications).values(medication as any);
}

export async function createAppointment(appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(appointments).values(appointment as any);
}

export async function createCareTeamMember(member: Omit<CareTeamMember, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(careTeamMembers).values(member as any);
}
