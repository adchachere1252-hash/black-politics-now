CREATE TABLE `election_day_rehearsals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('running','completed','cancelled') NOT NULL DEFAULT 'running',
	`scenario` varchar(256) NOT NULL,
	`started_by` varchar(128) NOT NULL,
	`steps` text NOT NULL,
	`notes` text,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `election_day_rehearsals_id` PRIMARY KEY(`id`)
);
