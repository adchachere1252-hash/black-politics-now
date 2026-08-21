CREATE TABLE `homepage_query_telemetry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`query_path` varchar(160) NOT NULL,
	`attempt` tinyint NOT NULL DEFAULT 1,
	`error_category` varchar(120) NOT NULL,
	`observed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `homepage_query_telemetry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `homepage_query_telemetry_observed_idx` ON `homepage_query_telemetry` (`observed_at`);--> statement-breakpoint
CREATE INDEX `homepage_query_telemetry_path_observed_idx` ON `homepage_query_telemetry` (`query_path`,`observed_at`);