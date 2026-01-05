CREATE TABLE `access_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`access_type` enum('full','trends_only','journal_only') NOT NULL DEFAULT 'full',
	`recipient_email` varchar(320),
	`recipient_name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`last_accessed_at` timestamp,
	CONSTRAINT `access_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `access_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`alert_type` enum('threshold','trend','compliance','clinical_action','low_battery','sensor_error') NOT NULL,
	`severity` enum('low','medium','high') NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`biomarker` varchar(32),
	`trigger_value` int,
	`metadata` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`is_dismissed` boolean NOT NULL DEFAULT false,
	`action_url` varchar(256),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`appointment_type` enum('psychiatrist','therapist','medication','assessment','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`appointment_date` timestamp NOT NULL,
	`location` varchar(255),
	`provider_name` varchar(255),
	`reminder_sent` boolean DEFAULT false,
	`reminder_days` int DEFAULT 1,
	`report_generated` boolean NOT NULL DEFAULT false,
	`report_generated_at` timestamp,
	`status` enum('scheduled','completed','cancelled','missed') DEFAULT 'scheduled',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biomarker_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`biomarker_type` enum('CRP','IL6','LEPTIN','PROINSULIN','BDNF') NOT NULL,
	`value` int NOT NULL,
	`unit` varchar(16) NOT NULL,
	`measured_at` timestamp NOT NULL,
	`device_id` int,
	`source` enum('patch','lab','manual') NOT NULL DEFAULT 'patch',
	`quality_score` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biomarker_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `care_team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider_role` enum('psychiatrist','therapist','nurse','case_manager','pharmacist','other') NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialty` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`organization` varchar(255),
	`address` text,
	`notes` text,
	`sharing_preferences` text,
	`last_contact_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `care_team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`device_name` varchar(255) NOT NULL,
	`device_type` enum('patch','wearable','other') NOT NULL DEFAULT 'patch',
	`serial_number` varchar(128),
	`firmware_version` varchar(64),
	`battery_level` int,
	`is_connected` boolean NOT NULL DEFAULT false,
	`last_sync_at` timestamp,
	`installed_at` timestamp,
	`expires_at` timestamp,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `devices_serial_number_unique` UNIQUE(`serial_number`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`insight_type` enum('pattern','relapse_risk','recommendation','correlation') NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high') NOT NULL,
	`confidence` int,
	`biomarkers` text,
	`recommendations` text,
	`metadata` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`is_dismissed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`entry_type` enum('symptom','medication','lifestyle','mood') NOT NULL,
	`entry_date` timestamp NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`severity` int,
	`tags` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`medication_id` int NOT NULL,
	`user_id` int NOT NULL,
	`taken_at` timestamp NOT NULL,
	`status` enum('taken','missed','skipped') NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medication_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`dosage` varchar(128) NOT NULL,
	`frequency` varchar(128) NOT NULL,
	`prescribed_by` varchar(255),
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`reminder_enabled` boolean NOT NULL DEFAULT false,
	`reminder_times` text,
	`side_effects` text,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`assessment_type` enum('mood','phq9','gad7') NOT NULL,
	`mood` varchar(64),
	`mood_score` int,
	`total_score` int,
	`responses` text,
	`notes` text,
	`assessment_date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mood_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relapse_risk_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`risk_score` int NOT NULL,
	`risk_level` enum('low','medium','high') NOT NULL,
	`contributing_factors` text,
	`biomarker_data` text,
	`calculated_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relapse_risk_scores_id` PRIMARY KEY(`id`)
);
