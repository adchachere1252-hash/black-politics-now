CREATE TABLE `podcast_play_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episode_date` varchar(10) NOT NULL,
	`segment_key` varchar(64),
	`segment_label` varchar(128),
	`playback_kind` enum('episode','segment') NOT NULL,
	`voice` enum('andrew','jenny') NOT NULL,
	`session_hash` varchar(64) NOT NULL,
	`played_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `podcast_play_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_show_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episode_date` varchar(10) NOT NULL,
	`title` varchar(256) NOT NULL,
	`summary` text NOT NULL,
	`show_notes` text NOT NULL,
	`keywords` text NOT NULL,
	`updated_by` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_show_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `podcast_show_notes_episode_date_unique` UNIQUE(`episode_date`)
);
--> statement-breakpoint
CREATE INDEX `podcast_play_events_played_at_idx` ON `podcast_play_events` (`played_at`);--> statement-breakpoint
CREATE INDEX `podcast_play_events_episode_idx` ON `podcast_play_events` (`episode_date`);--> statement-breakpoint
CREATE INDEX `podcast_play_events_segment_idx` ON `podcast_play_events` (`segment_key`);