CREATE TABLE `election_candidate_edits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contest_type` enum('senate','house') NOT NULL,
	`contest_id` int NOT NULL,
	`state_code` varchar(2) NOT NULL,
	`district_label` varchar(16),
	`candidate1_name` varchar(128),
	`candidate1_party` enum('D','R','I','L','G'),
	`candidate2_name` varchar(128),
	`candidate2_party` enum('D','R','I','L','G'),
	`source_url` varchar(2048) NOT NULL,
	`source_label` varchar(256) NOT NULL,
	`editor_name` varchar(128) NOT NULL,
	`editor_note` text,
	`previous_value` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `election_candidate_edits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `house_races` ADD `candidate_source_url` varchar(2048);--> statement-breakpoint
ALTER TABLE `house_races` ADD `candidate_source_label` varchar(256);--> statement-breakpoint
ALTER TABLE `senate_races` ADD `candidate_source_url` varchar(2048);--> statement-breakpoint
ALTER TABLE `senate_races` ADD `candidate_source_label` varchar(256);--> statement-breakpoint
CREATE INDEX `election_candidate_edits_contest_created_idx` ON `election_candidate_edits` (`contest_type`,`contest_id`,`created_at`);