CREATE TABLE `podcast_recovery_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episode_date` varchar(10) NOT NULL,
	`status` enum('queued','running','completed','held','failed') NOT NULL DEFAULT 'queued',
	`requested_by` varchar(128) NOT NULL,
	`note` text,
	`result_message` text,
	`requested_at` timestamp NOT NULL DEFAULT (now()),
	`handled_at` timestamp,
	CONSTRAINT `podcast_recovery_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `episodes` ADD `jennyFullEpisodeCdnUrl` text;