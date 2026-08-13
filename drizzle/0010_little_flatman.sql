CREATE TABLE `agent_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recommendation_id` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`owner` varchar(128),
	`status` enum('open','in_progress','blocked','completed') NOT NULL DEFAULT 'open',
	`created_by` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completed_at` timestamp,
	CONSTRAINT `agent_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_tasks_recommendation_id_unique` UNIQUE(`recommendation_id`)
);
--> statement-breakpoint
ALTER TABLE `agent_recommendations` ADD `assigned_to` varchar(128);--> statement-breakpoint
ALTER TABLE `agent_recommendations` ADD `assigned_by` varchar(128);--> statement-breakpoint
ALTER TABLE `agent_recommendations` ADD `assigned_at` timestamp;--> statement-breakpoint
ALTER TABLE `agent_runs` ADD `mode` enum('routine','election_night') DEFAULT 'routine' NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_settings` ADD `priority_mode_enabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_settings` ADD `priority_mode_expires_at` timestamp;--> statement-breakpoint
ALTER TABLE `agent_settings` ADD `priority_schedule_cron_task_uid` varchar(65);