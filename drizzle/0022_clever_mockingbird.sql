CREATE TABLE `portrait_research_batch_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batch_id` int NOT NULL,
	`target_type` enum('senate','house','governor','black_representation') NOT NULL,
	`target_record_id` int NOT NULL,
	`target_photo_field` enum('candidate1','candidate2','dem','rep','profile') NOT NULL,
	`candidate_name` varchar(128) NOT NULL,
	`location` varchar(160) NOT NULL,
	`status` enum('queued','in_progress','ready_for_review','blocked','skipped') NOT NULL DEFAULT 'queued',
	`agent_task_id` int,
	`error` text,
	`started_at` timestamp,
	`completed_at` timestamp,
	CONSTRAINT `portrait_research_batch_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portrait_research_batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('running','completed','completed_with_failures') NOT NULL DEFAULT 'running',
	`requested_by` varchar(128) NOT NULL,
	`total_targets` int NOT NULL,
	`completed_targets` int NOT NULL DEFAULT 0,
	`failed_targets` int NOT NULL DEFAULT 0,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`summary` text,
	CONSTRAINT `portrait_research_batches_id` PRIMARY KEY(`id`)
);
