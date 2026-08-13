CREATE TABLE `world_election_watches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`world_election_id` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`schedule_cron_task_uid` varchar(65),
	`last_checked_at` timestamp,
	`last_fingerprint` varchar(64),
	`last_source_snapshot` text,
	`last_review_recommendation_id` int,
	`last_detected_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `world_election_watches_id` PRIMARY KEY(`id`),
	CONSTRAINT `world_election_watches_world_election_id_unique` UNIQUE(`world_election_id`)
);
--> statement-breakpoint
ALTER TABLE `world_elections` ADD `source_urls` text;