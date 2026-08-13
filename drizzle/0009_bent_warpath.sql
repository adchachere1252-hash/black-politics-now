CREATE TABLE `agent_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`run_id` int NOT NULL,
	`category` enum('data_quality','editorial','coverage_gap','source_watch','product') NOT NULL,
	`priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`title` varchar(256) NOT NULL,
	`summary` text NOT NULL,
	`proposed_action` text NOT NULL,
	`evidence` text NOT NULL,
	`status` enum('pending','approved','dismissed','deferred') NOT NULL DEFAULT 'pending',
	`reviewed_by` varchar(128),
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trigger` enum('manual','admin','scheduled') NOT NULL,
	`status` enum('running','success','failed','skipped') NOT NULL DEFAULT 'running',
	`model` varchar(64) NOT NULL,
	`source_snapshot` text,
	`summary` text,
	`recommendation_count` int NOT NULL DEFAULT 0,
	`error_message` text,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `agent_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_settings` (
	`id` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`research_interval_hours` int NOT NULL DEFAULT 4,
	`schedule_cron_task_uid` varchar(65),
	`last_run_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_settings_id` PRIMARY KEY(`id`)
);
