CREATE TABLE `education_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`site_id` text NOT NULL,
	`user_id` text NOT NULL,
	`signature_data` text,
	`signed_at` integer,
	`created_at` integer,
	FOREIGN KEY (`content_id`) REFERENCES `education_contents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `education_completions_site_idx` ON `education_completions` (`site_id`);--> statement-breakpoint
CREATE INDEX `education_completions_content_idx` ON `education_completions` (`content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `education_completions_content_id_user_id_unique` ON `education_completions` (`content_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `education_contents` ADD `external_source` text DEFAULT 'LOCAL' NOT NULL;--> statement-breakpoint
ALTER TABLE `education_contents` ADD `external_id` text;--> statement-breakpoint
ALTER TABLE `education_contents` ADD `source_url` text;--> statement-breakpoint
ALTER TABLE `post_images` ADD `media_type` text DEFAULT 'image' NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `question_type` text DEFAULT 'SINGLE_CHOICE' NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `correct_answer_text` text;--> statement-breakpoint
CREATE INDEX `actions_assignee_idx` ON `actions` (`assignee_id`);--> statement-breakpoint
CREATE INDEX `actions_status_idx` ON `actions` (`action_status`);--> statement-breakpoint
CREATE INDEX `site_memberships_user_idx` ON `site_memberships` (`user_id`);