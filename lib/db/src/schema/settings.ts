import { pgTable, serial, text, real, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Smartledger Premium Web3"),
  adminEmail: text("admin_email").notNull().default("smartsafepalpremium@gmail.com"),
  referralBonusPercent: real("referral_bonus_percent").notNull().default(5),
  minDeposit: real("min_deposit").notNull().default(100),
  minWithdrawal: real("min_withdrawal").notNull().default(50),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  welcomeBonus: real("welcome_bonus").notNull().default(0),
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
