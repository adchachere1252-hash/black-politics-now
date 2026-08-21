CREATE TABLE `election_result_confirmations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`race_type` enum('senate','house','governor') NOT NULL,
	`race_id` int NOT NULL,
	`jurisdiction` varchar(160) NOT NULL,
	`winner_name` varchar(128) NOT NULL,
	`winner_party` enum('D','R','I') NOT NULL,
	`source_url` varchar(2048) NOT NULL,
	`source_label` varchar(256) NOT NULL,
	`confirmation_note` text,
	`confirmed_by` varchar(128) NOT NULL,
	`prior_value` text NOT NULL,
	`confirmed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `election_result_confirmations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `election_result_confirmations_race_idx` ON `election_result_confirmations` (`race_type`,`race_id`,`confirmed_at`);--> statement-breakpoint
CREATE INDEX `election_result_confirmations_confirmed_at_idx` ON `election_result_confirmations` (`confirmed_at`);