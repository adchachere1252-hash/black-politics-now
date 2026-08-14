ALTER TABLE `agent_tasks` MODIFY COLUMN `status` enum('open','in_progress','blocked','ready_for_review','completed') NOT NULL DEFAULT 'open';--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `execution_mode` enum('human','agent') DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `execution_scope` text;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `source_requirements` text;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `agent_work_package` text;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `agent_work_package_sources` text;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `execution_started_at` timestamp;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `execution_completed_at` timestamp;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `execution_error` text;