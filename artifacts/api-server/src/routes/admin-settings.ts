import { Router } from "express";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    let [settings] = await db.select().from(settingsTable).limit(1);
    if (!settings) {
      [settings] = await db.insert(settingsTable).values({}).returning();
    }
    res.json(fmt(settings!));
  } catch (err) {
    req.log.error({ err }, "getSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/", async (req: Request, res: Response) => {
  try {
    let [existing] = await db.select().from(settingsTable).limit(1);
    const updates: Partial<typeof settingsTable.$inferInsert> = {};
    const body = req.body as Partial<typeof settingsTable.$inferInsert>;
    for (const k of ["siteName","adminEmail","referralBonusPercent","minDeposit","minWithdrawal","maintenanceMode","welcomeBonus","smtpHost","smtpPort","smtpUser","smtpPass"] as const) {
      if (body[k] !== undefined) (updates as Record<string, unknown>)[k] = body[k];
    }

    let settings: typeof settingsTable.$inferSelect;
    if (existing) {
      [settings] = await db.update(settingsTable).set(updates).where(eq(settingsTable.id, existing.id)).returning();
    } else {
      [settings] = await db.insert(settingsTable).values(updates).returning();
    }
    res.json(fmt(settings!));
  } catch (err) {
    req.log.error({ err }, "updateSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function fmt(s: typeof settingsTable.$inferSelect) {
  return {
    siteName: s.siteName, adminEmail: s.adminEmail,
    referralBonusPercent: s.referralBonusPercent, minDeposit: s.minDeposit,
    minWithdrawal: s.minWithdrawal, maintenanceMode: s.maintenanceMode,
    welcomeBonus: s.welcomeBonus, smtpHost: s.smtpHost, smtpPort: s.smtpPort, smtpUser: s.smtpUser,
  };
}

export default router;
