CREATE TABLE `site_analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_path` varchar(512) NOT NULL,
	`session_hash` varchar(64) NOT NULL,
	`device_type` enum('desktop','tablet','mobile') NOT NULL,
	`referrer_host` varchar(255),
	`visited_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `site_analytics_visited_at_idx` ON `site_analytics_events` (`visited_at`);--> statement-breakpoint
CREATE INDEX `site_analytics_page_visited_idx` ON `site_analytics_events` (`page_path`,`visited_at`);--> statement-breakpoint
CREATE INDEX `site_analytics_session_visited_idx` ON `site_analytics_events` (`session_hash`,`visited_at`);