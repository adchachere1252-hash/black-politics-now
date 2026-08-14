CREATE TABLE `world_election_refresh_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`world_election_id` int NOT NULL,
	`last_fingerprint` varchar(64),
	`last_checked_at` timestamp,
	`last_changed_at` timestamp,
	`last_status` varchar(32),
	`last_source_snapshot` text,
	`last_recommendation_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `world_election_refresh_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `world_election_refresh_items_world_election_id_unique` UNIQUE(`world_election_id`)
);
--> statement-breakpoint
CREATE TABLE `world_election_refresh_settings` (
	`id` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`schedule_cron_task_uid` varchar(65),
	`last_run_at` timestamp,
	`last_success_at` timestamp,
	`last_summary` text,
	`last_error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `world_election_refresh_settings_id` PRIMARY KEY(`id`)
);
