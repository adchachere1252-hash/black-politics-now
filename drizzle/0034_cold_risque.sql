CREATE TABLE `governor_candidate_edits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`governor_race_id` int NOT NULL,
	`state_code` varchar(2) NOT NULL,
	`dem_candidate` varchar(128),
	`rep_candidate` varchar(128),
	`source_url` varchar(2048) NOT NULL,
	`source_label` varchar(256) NOT NULL,
	`editor_name` varchar(128) NOT NULL,
	`editor_note` text,
	`previous_value` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `governor_candidate_edits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `governor_races` ADD `candidate_source_url` varchar(2048);--> statement-breakpoint
ALTER TABLE `governor_races` ADD `candidate_source_label` varchar(256);--> statement-breakpoint
CREATE INDEX `governor_candidate_edits_race_created_idx` ON `governor_candidate_edits` (`governor_race_id`,`created_at`);