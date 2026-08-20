CREATE TABLE `black_representation_addition_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`target_type` enum('black_representation_profile','black_representation_contest') NOT NULL,
	`target_id` int NOT NULL,
	`display_name` varchar(160) NOT NULL,
	`state_code` varchar(2) NOT NULL,
	`district` varchar(16) NOT NULL,
	`source_url` text NOT NULL,
	`source_label` varchar(160) NOT NULL,
	`added_by` varchar(128) NOT NULL,
	`addition_note` text,
	`snapshot_json` text NOT NULL,
	`added_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `black_representation_addition_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `black_rep_addition_target_idx` ON `black_representation_addition_audit` (`target_type`,`target_id`,`added_at`);