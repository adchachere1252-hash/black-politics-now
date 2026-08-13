ALTER TABLE `agent_settings` ADD `default_editorial_owner` varchar(128) DEFAULT 'Editorial Desk';--> statement-breakpoint
ALTER TABLE `agent_settings` ADD `default_data_quality_owner` varchar(128) DEFAULT 'Data Desk';--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `due_date` timestamp;