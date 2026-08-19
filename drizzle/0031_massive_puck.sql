CREATE TABLE `candidate_removal_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`target_type` enum('black_representation_profile','black_representation_contest') NOT NULL,
	`target_id` int NOT NULL,
	`display_name` varchar(160) NOT NULL,
	`state_code` varchar(2),
	`district` varchar(16),
	`reason` text NOT NULL,
	`source_url` text,
	`removed_by` varchar(128) NOT NULL,
	`snapshot_json` text NOT NULL,
	`removed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `candidate_removal_audit_id` PRIMARY KEY(`id`)
);
