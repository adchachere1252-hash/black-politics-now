CREATE TABLE `podcast_gate_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episode_date` varchar(10) NOT NULL,
	`gate_status` enum('passed','alert_sent','alert_failed') NOT NULL,
	`preflight_status` varchar(16),
	`message` text NOT NULL,
	`notification_sent` boolean NOT NULL DEFAULT false,
	`notified_at` timestamp,
	`checked_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_gate_alerts_id` PRIMARY KEY(`id`),
	CONSTRAINT `podcast_gate_alerts_episode_date_unique` UNIQUE(`episode_date`)
);
--> statement-breakpoint
ALTER TABLE `podcast_recovery_requests` ADD `recovery_mode` enum('audio_repair','full_guard') DEFAULT 'audio_repair' NOT NULL;