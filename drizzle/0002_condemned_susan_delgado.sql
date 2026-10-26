CREATE TABLE `spotify_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`seed_hash` text NOT NULL,
	`refresh_token` text NOT NULL
);
