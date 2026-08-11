ALTER TABLE `cbc_members` DROP INDEX `cbc_members_district_unique`;--> statement-breakpoint
ALTER TABLE `cbc_members` DROP INDEX `cbc_members_district_unique`;--> statement-breakpoint
ALTER TABLE `cbc_members` MODIFY COLUMN `cbc_status` enum('running','retiring','resigned','deceased','lost_primary','running_for_governor','running_for_senate','not_up_2026','challenger','advanced_to_general','in_runoff','too_close_to_call','elected') NOT NULL DEFAULT 'running';--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `role_type` enum('incumbent','nominee','challenger','former_member','delegate') DEFAULT 'incumbent' NOT NULL;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `is_current_member` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `race_stage` enum('pre_primary','primary','runoff','general','special','called','not_up') DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `primary_votes` bigint;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `primary_vote_pct` decimal(5,2);--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `primary_opponent` varchar(128);--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `primary_date` varchar(32);--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `runoff_votes` bigint;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `runoff_vote_pct` decimal(5,2);--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `runoff_opponent` varchar(128);--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `runoff_date` varchar(32);--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `source_url` text;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `source_label` varchar(128);--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `redistricting_context` text;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `aipac_funding` text;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `race_summary` text;--> statement-breakpoint
ALTER TABLE `cbc_members` ADD `risk_level` enum('safe','watch','endangered');
