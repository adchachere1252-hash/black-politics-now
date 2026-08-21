ALTER TABLE `black_representation_addition_audit` MODIFY COLUMN `district` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `black_representation_elections` MODIFY COLUMN `district` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `candidate_removal_audit` MODIFY COLUMN `district` varchar(128);--> statement-breakpoint
ALTER TABLE `cbc_members` MODIFY COLUMN `district` varchar(128) NOT NULL;
ALTER TABLE `black_representation_addition_audit` MODIFY COLUMN `district` varchar(128) NOT NULL;
