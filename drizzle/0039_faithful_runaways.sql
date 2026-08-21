CREATE TABLE `election_ticker_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jurisdiction` varchar(160) NOT NULL,
	`chamber` enum('Senate','House','Governor') NOT NULL,
	`winner_name` varchar(128) NOT NULL,
	`winner_party` enum('D','R','I','L','G') NOT NULL,
	`source_url` varchar(2048) NOT NULL,
	`source_label` varchar(256) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `election_ticker_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `election_ticker_entry_edits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker_entry_id` int NOT NULL,
	`action` enum('created','updated','reordered','removed') NOT NULL,
	`source_url` varchar(2048) NOT NULL,
	`source_label` varchar(256) NOT NULL,
	`editor_name` varchar(128) NOT NULL,
	`editor_note` text,
	`previous_value` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `election_ticker_entry_edits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `election_ticker_entries_active_order_idx` ON `election_ticker_entries` (`is_active`,`sort_order`,`id`);--> statement-breakpoint
CREATE INDEX `election_ticker_entry_edits_entry_created_idx` ON `election_ticker_entry_edits` (`ticker_entry_id`,`created_at`);