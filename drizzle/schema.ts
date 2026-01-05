import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "provider"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Provider-Patient relationships for healthcare provider portal
 */
export const providerPatients = mysqlTable("provider_patients", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("provider_id").notNull(),
  patientId: int("patient_id").notNull(),
  relationshipType: mysqlEnum("relationship_type", ["primary", "specialist", "therapist", "consultant"]).default("primary").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProviderPatient = typeof providerPatients.$inferSelect;
export type InsertProviderPatient = typeof providerPatients.$inferInsert;

/**
 * Biomarker readings - 5 validated biomarkers for mental health monitoring
 * CRP, IL-6, Leptin, Proinsulin, BDNF
 */
export const biomarkerReadings = mysqlTable("biomarker_readings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  biomarkerType: mysqlEnum("biomarker_type", ["CRP", "IL6", "LEPTIN", "PROINSULIN", "BDNF"]).notNull(),
  value: int("value").notNull(), // Stored in appropriate units (mg/L, pg/mL, ng/mL)
  unit: varchar("unit", { length: 16 }).notNull(),
  measuredAt: timestamp("measured_at").notNull(),
  deviceId: int("device_id"),
  source: mysqlEnum("source", ["patch", "lab", "manual"]).default("patch").notNull(),
  qualityScore: int("quality_score"), // 0-100 quality indicator
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BiomarkerReading = typeof biomarkerReadings.$inferSelect;
export type InsertBiomarkerReading = typeof biomarkerReadings.$inferInsert;

/**
 * Mood assessments - PHQ-9, GAD-7, and simple mood tracking
 */
export const moodAssessments = mysqlTable("mood_assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  assessmentType: mysqlEnum("assessment_type", ["mood", "phq9", "gad7"]).notNull(),
  mood: varchar("mood", { length: 64 }), // happy, sad, anxious, etc.
  moodScore: int("mood_score"), // 1-10 scale
  totalScore: int("total_score"), // For PHQ-9 and GAD-7
  responses: text("responses"), // JSON array of question responses
  notes: text("notes"),
  assessmentDate: timestamp("assessment_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MoodAssessment = typeof moodAssessments.$inferSelect;
export type InsertMoodAssessment = typeof moodAssessments.$inferInsert;

/**
 * Medications - tracking prescriptions and adherence
 */
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 128 }).notNull(),
  frequency: varchar("frequency", { length: 128 }).notNull(),
  prescribedBy: varchar("prescribed_by", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  reminderEnabled: boolean("reminder_enabled").default(false).notNull(),
  reminderTimes: text("reminder_times"), // JSON array of times
  sideEffects: text("side_effects"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

/**
 * Medication logs - tracking adherence
 */
export const medicationLogs = mysqlTable("medication_logs", {
  id: int("id").autoincrement().primaryKey(),
  medicationId: int("medication_id").notNull(),
  userId: int("user_id").notNull(),
  takenAt: timestamp("taken_at").notNull(),
  status: mysqlEnum("status", ["taken", "missed", "skipped"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = typeof medicationLogs.$inferInsert;

/**
 * Devices - biomarker patches and wearables
 */
export const devices = mysqlTable("devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  deviceName: varchar("device_name", { length: 255 }).notNull(),
  deviceType: mysqlEnum("device_type", ["patch", "wearable", "other"]).default("patch").notNull(),
  serialNumber: varchar("serial_number", { length: 128 }).unique(),
  firmwareVersion: varchar("firmware_version", { length: 64 }),
  batteryLevel: int("battery_level"), // 0-100
  isConnected: boolean("is_connected").default(false).notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  installedAt: timestamp("installed_at"),
  expiresAt: timestamp("expires_at"),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = typeof devices.$inferInsert;

/**
 * Alerts - system-generated alerts for threshold/trend violations
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  alertType: mysqlEnum("alert_type", [
    "threshold",
    "trend",
    "compliance",
    "clinical_action",
    "low_battery",
    "sensor_error"
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  biomarker: varchar("biomarker", { length: 32 }), // CRP, IL6, LEPTIN, PROINSULIN, BDNF
  triggerValue: int("trigger_value"),
  metadata: text("metadata"), // JSON for additional context
  isRead: boolean("is_read").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  actionUrl: varchar("action_url", { length: 256 }), // Deep link for action
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Journal entries - symptom logs, medication tracking, lifestyle factors
 */
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  entryType: mysqlEnum("entry_type", ["symptom", "medication", "lifestyle", "mood"]).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  severity: int("severity"), // 1-10 scale for symptoms
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Appointments - scheduling system for mental health care
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  appointmentType: mysqlEnum("appointment_type", ["psychiatrist", "therapist", "medication", "assessment", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  appointmentDate: timestamp("appointment_date").notNull(),
  location: varchar("location", { length: 255 }),
  providerName: varchar("provider_name", { length: 255 }),
  reminderSent: boolean("reminder_sent").default(false),
  reminderDays: int("reminder_days").default(1),
  reportGenerated: boolean("report_generated").default(false).notNull(),
  reportGeneratedAt: timestamp("report_generated_at"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "missed"]).default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Care team members for healthcare provider coordination
 */
export const careTeamMembers = mysqlTable("care_team_members", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  providerRole: mysqlEnum("provider_role", ["psychiatrist", "therapist", "nurse", "case_manager", "pharmacist", "other"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  organization: varchar("organization", { length: 255 }),
  address: text("address"),
  notes: text("notes"),
  sharingPreferences: text("sharing_preferences"), // JSON: { trends: true, journal: true, insights: true }
  lastContactDate: timestamp("last_contact_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CareTeamMember = typeof careTeamMembers.$inferSelect;
export type InsertCareTeamMember = typeof careTeamMembers.$inferInsert;

/**
 * AI-generated insights - pattern detection and relapse prediction
 */
export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  insightType: mysqlEnum("insight_type", ["pattern", "relapse_risk", "recommendation", "correlation"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).notNull(),
  confidence: int("confidence"), // 0-100
  biomarkers: text("biomarkers"), // JSON array of involved biomarkers
  recommendations: text("recommendations"), // JSON array of action items
  metadata: text("metadata"), // JSON for additional context
  isRead: boolean("is_read").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

/**
 * Relapse risk scores - predictive analytics
 */
export const relapseRiskScores = mysqlTable("relapse_risk_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  riskScore: int("risk_score").notNull(), // 0-100
  riskLevel: mysqlEnum("risk_level", ["low", "medium", "high"]).notNull(),
  contributingFactors: text("contributing_factors"), // JSON array
  biomarkerData: text("biomarker_data"), // JSON snapshot of biomarker values
  calculatedAt: timestamp("calculated_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RelapseRiskScore = typeof relapseRiskScores.$inferSelect;
export type InsertRelapseRiskScore = typeof relapseRiskScores.$inferInsert;

/**
 * Access tokens for secure data sharing with healthcare providers
 */
export const accessTokens = mysqlTable("access_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  accessType: mysqlEnum("access_type", ["full", "trends_only", "journal_only"]).default("full").notNull(),
  recipientEmail: varchar("recipient_email", { length: 320 }),
  recipientName: varchar("recipient_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
});

export type AccessToken = typeof accessTokens.$inferSelect;
export type InsertAccessToken = typeof accessTokens.$inferInsert;
