import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, referralsTable, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";
import { alias } from "drizzle-orm/pg-core";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const referrerUsers = alias(usersTable, "referrer_users");
    const referredUsers = alias(usersTable, "referred_users");

    const rows = await db
      .select({
        id: referralsTable.id,
        referrerId: referralsTable.referrerId,
        referredId: referralsTable.referredId,
        bonusAmount: referralsTable.bonusAmount,
        createdAt: referralsTable.createdAt,
        referrerEmail: referrerUsers.email,
        referredEmail: referredUsers.email,
      })
      .from(referralsTable)
      .leftJoin(referrerUsers, eq(referralsTable.referrerId, referrerUsers.id))
      .leftJoin(referredUsers, eq(referralsTable.referredId, referredUsers.id))
      .orderBy(sql`${referralsTable.createdAt} desc`);

    res.json(rows.map(r => ({
      id: r.id,
      referrerId: r.referrerId,
      referrerEmail: r.referrerEmail ?? null,
      referredId: r.referredId,
      referredEmail: r.referredEmail ?? null,
      bonusAmount: r.bonusAmount,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "listReferrals error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
