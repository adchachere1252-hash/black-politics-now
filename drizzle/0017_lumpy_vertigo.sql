CREATE TABLE `agent_change_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_id` int NOT NULL,
	`kind` enum('article_link','data_correction','editorial_copy') NOT NULL,
	`title` varchar(256) NOT NULL,
	`target_type` varchar(80) NOT NULL,
	`target_reference` text NOT NULL,
	`before_value` text,
	`proposed_value` text NOT NULL,
	`rationale` text NOT NULL,
	`evidence` text NOT NULL,
	`status` enum('pending_review','approved','rejected','revision_requested') NOT NULL DEFAULT 'pending_review',
	`reviewer_notes` text,
	`reviewed_by` varchar(128),
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_change_proposals_id` PRIMARY KEY(`id`)
);
