import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const guestbook = sqliteTable("guestbook", { id: integer("id").primaryKey({ autoIncrement: true }), ornament: text("ornament").notNull().default("star"), nickname: text("nickname").notNull(), message: text("message").notNull(), createdAt: integer("created_at").notNull(), deletedAt: integer("deleted_at"), deleteHash: text("delete_hash").notNull(), requestId: text("request_id").notNull().unique(), rateKey: text("rate_key").notNull() }, t => [index("guestbook_rate").on(t.rateKey, t.createdAt)]);

export const spotifyTokens = sqliteTable("spotify_tokens", { id: text("id").primaryKey(), seedHash: text("seed_hash").notNull(), refreshToken: text("refresh_token").notNull() });
