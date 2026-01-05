CREATE TABLE `provider_patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider_id` int NOT NULL,
	`patient_id` int NOT NULL,
	`relationship_type` enum('primary','specialist','therapist','consultant') NOT NULL DEFAULT 'primary',
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `provider_patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','provider') NOT NULL DEFAULT 'user';