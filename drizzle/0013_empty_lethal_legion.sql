CREATE TABLE `podcast_preflights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episode_date` varchar(10) NOT NULL,
	`status` varchar(16) NOT NULL,
	`topic_count` int NOT NULL DEFAULT 0,
	`ready_count` int NOT NULL DEFAULT 0,
	`report` text,
	`checked_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_preflights_id` PRIMARY KEY(`id`),
	CONSTRAINT `podcast_preflights_episode_date_unique` UNIQUE(`episode_date`)
);
