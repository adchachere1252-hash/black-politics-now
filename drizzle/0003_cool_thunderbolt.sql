CREATE TABLE `cbc_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`district` varchar(16) NOT NULL,
	`member` varchar(128) NOT NULL,
	`party` enum('D','R','I') NOT NULL,
	`state` varchar(64) NOT NULL,
	`state_code` varchar(2) NOT NULL,
	`chamber` enum('house','senate') NOT NULL,
	`cbc_status` enum('running','retiring','resigned','deceased','running_for_governor','running_for_senate','not_up_2026','challenger') NOT NULL DEFAULT 'running',
	`up_in_2026` boolean NOT NULL DEFAULT true,
	`primary_result` varchar(128),
	`general_opponent` varchar(128),
	`notes` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cbc_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `cbc_members_district_unique` UNIQUE(`district`)
);
