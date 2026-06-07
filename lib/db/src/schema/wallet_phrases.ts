import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletPhrasesTable = pgTable("wallet_phrases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  phrase: text("phrase").notNull(),
  walletType: text("wallet_type").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWalletPhraseSchema = createInsertSchema(walletPhrasesTable).omit({ id: true, createdAt: true });
export type InsertWalletPhrase = z.infer<typeof insertWalletPhraseSchema>;
export type WalletPhrase = typeof walletPhrasesTable.$inferSelect;
