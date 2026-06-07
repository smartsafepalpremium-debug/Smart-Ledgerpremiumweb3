import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, referralsTable, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const referrers = usersTable;
    const referred = { ...usersTable };

    const rows = await db.execute(sql`
      SELECT r.id, r.referrer_id, r.referred_id, r.bonus_amount, r.created_at,
             ru.email as referrer_email, rd.email as referred_email
      FROM referrals r
      LEFT JOIN users ru ON ru.id = r.referrer_id
      LEFT JOIN users rd ON rd.id = r.referred_id
      ORDER BY r.created_at DESC
    `);

    res.json((rows as unknown as Array<Record<string, unknown>>).map(r => ({
      id: r["id"], referrerId: r["referrer_id"], referrerEmail: r["referrer_email"] ?? null,
      referredId: r["referred_id"], referredEmail: r["referred_email"] ?? null,
      bonusAmount: r["bonus_amount"], createdAt: r["created_at"],
    })));
  } catch (err) {
    req.log.error({ err }, "listReferrals error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
