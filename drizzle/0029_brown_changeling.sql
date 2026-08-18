CREATE TABLE `certified_result_archive_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`archive_id` int NOT NULL,
	`chamber` enum('Senate','House','Governor','Referendum') NOT NULL,
	`source_record_id` int NOT NULL,
	`contest_key` varchar(128) NOT NULL,
	`jurisdiction` varchar(128) NOT NULL,
	`result_label` varchar(256) NOT NULL,
	`winner_or_result` varchar(256) NOT NULL,
	`party_or_side` varchar(32),
	`source_url` varchar(2048) NOT NULL,
	`snapshot_json` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certified_result_archive_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `certified_results_archive_entry_unique` UNIQUE(`archive_id`,`chamber`,`source_record_id`)
);
--> statement-breakpoint
CREATE TABLE `certified_result_archives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`archive_key` varchar(96) NOT NULL,
	`title` varchar(256) NOT NULL,
	`certification_authority` varchar(256) NOT NULL,
	`certification_source_url` varchar(2048) NOT NULL,
	`certification_statement` text NOT NULL,
	`certified_at` timestamp NOT NULL,
	`certified_by` varchar(128) NOT NULL,
	`snapshot_digest` varchar(64) NOT NULL,
	`entry_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certified_result_archives_id` PRIMARY KEY(`id`),
	CONSTRAINT `certified_result_archives_archive_key_unique` UNIQUE(`archive_key`)
);
--> statement-breakpoint
CREATE INDEX `certified_results_archive_entry_archive_idx` ON `certified_result_archive_entries` (`archive_id`,`chamber`);--> statement-breakpoint
CREATE INDEX `certified_results_archive_certified_at_idx` ON `certified_result_archives` (`certified_at`);