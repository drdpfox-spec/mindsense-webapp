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
