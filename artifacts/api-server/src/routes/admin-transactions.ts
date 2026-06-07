import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, transactionsTable, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query["page"] ?? 1);
    const limit = 25;
    const userId = req.query["userId"] ? Number(req.query["userId"]) : undefined;
    const type = req.query["type"] as string | undefined;
    const offset = (page - 1) * limit;

    const where = userId ? eq(transactionsTable.userId, userId) : undefined;

    const [txs, totalResult] = await Promise.all([
      db.select({
        tx: transactionsTable,
        userEmail: usersTable.email,
      }).from(transactionsTable)
        .leftJoin(usersTable, eq(transactionsTable.userId, usersTable.id))
        .where(where).limit(limit).offset(offset)
        .orderBy(sql`${transactionsTable.createdAt} desc`),
      db.select({ count: count() }).from(transactionsTable).where(where),
    ]);

    res.json({
      transactions: txs.map(r => ({
        id: r.tx.id, userId: r.tx.userId, userEmail: r.userEmail,
        type: r.tx.type, amount: r.tx.amount, status: r.tx.status,
        description: r.tx.description, createdAt: r.tx.createdAt.toISOString(),
      })),
      total: Number(totalResult[0]!.count),
      page,
    });
  } catch (err) {
    req.log.error({ err }, "listTransactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
