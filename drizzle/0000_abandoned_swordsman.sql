CREATE TABLE `guestbook` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	`delete_hash` text NOT NULL,
	`request_id` text NOT NULL,
	`rate_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guestbook_request_id_unique` ON `guestbook` (`request_id`);--> statement-breakpoint
CREATE INDEX `guestbook_rate` ON `guestbook` (`rate_key`,`created_at`);