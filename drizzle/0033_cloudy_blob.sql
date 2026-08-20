CREATE TABLE `atlas_editorial_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`state_code` varchar(2) NOT NULL,
	`congress` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`source_label` varchar(160) NOT NULL,
	`source_url` text NOT NULL,
	`status` enum('draft','approved') NOT NULL DEFAULT 'draft',
	`created_by` varchar(128) NOT NULL,
	`approved_by` varchar(128),
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `atlas_editorial_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `atlas_operations_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`audit_type` enum('playback_contract') NOT NULL,
	`status` enum('passed','warning','failed') NOT NULL,
	`summary` text NOT NULL,
	`details_json` text NOT NULL,
	`initiated_by` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atlas_operations_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `atlas_editorial_note_scope_idx` ON `atlas_editorial_notes` (`state_code`,`congress`,`status`);--> statement-breakpoint
CREATE INDEX `atlas_editorial_note_status_updated_idx` ON `atlas_editorial_notes` (`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `atlas_operations_audit_created_idx` ON `atlas_operations_audits` (`created_at`);--> statement-breakpoint
CREATE INDEX `atlas_operations_audit_type_created_idx` ON `atlas_operations_audits` (`audit_type`,`created_at`);