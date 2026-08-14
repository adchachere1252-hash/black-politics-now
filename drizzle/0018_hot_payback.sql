CREATE TABLE `election_day_status` (
	`id` int NOT NULL,
	`mode` enum('standby','active','degraded') NOT NULL DEFAULT 'standby',
	`source_name` varchar(64) NOT NULL DEFAULT 'DDHQ',
	`active_date` varchar(16),
	`heartbeat_at` timestamp,
	`last_poll_at` timestamp,
	`mapped_races` int NOT NULL DEFAULT 0,
	`updated_races` int NOT NULL DEFAULT 0,
	`failed_polls` int NOT NULL DEFAULT 0,
	`new_calls` int NOT NULL DEFAULT 0,
	`source_health` enum('unknown','healthy','degraded') NOT NULL DEFAULT 'unknown',
	`last_summary` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `election_day_status_id` PRIMARY KEY(`id`)
);
