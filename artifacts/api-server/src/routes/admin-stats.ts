import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sum, count, sql } from "drizzle-orm";
import { db, usersTable, depositsTable, withdrawalsTable, loansTable, transactionsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const [
      totalUsersResult,
      pendingDepositsResult,
      pendingWithdrawalsResult,
      pendingLoansResult,
      totalDepositedResult,
      totalWithdrawnResult,
      recentActivity,
    ] = await Promise.all([
      db.select({ count: count() }).from(usersTable),
      db.select({ count: count() }).from(depositsTable).where(eq(depositsTable.status, "pending")),
      db.select({ count: count() }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "pending")),
      db.select({ count: count() }).from(loansTable).where(eq(loansTable.status, "pending")),
      db.select({ total: sum(depositsTable.amount) }).from(depositsTable).where(eq(depositsTable.status, "approved")),
      db.select({ total: sum(withdrawalsTable.amount) }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "approved")),
      db.select({ tx: transactionsTable }).from(transactionsTable).orderBy(sql`${transactionsTable.createdAt} desc`).limit(10),
    ]);

    res.json({
      totalUsers: Number(totalUsersResult[0]!.count),
      pendingDeposits: Number(pendingDepositsResult[0]!.count),
      pendingWithdrawals: Number(pendingWithdrawalsResult[0]!.count),
      pendingLoans: Number(pendingLoansResult[0]!.count),
      totalDeposited: Number(totalDepositedResult[0]!.total ?? 0),
      totalWithdrawn: Number(totalWithdrawnResult[0]!.total ?? 0),
      recentActivity: recentActivity.map(r => ({
        type: r.tx.type,
        description: r.tx.description ?? `${r.tx.type} $${r.tx.amount}`,
        createdAt: r.tx.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "getAdminStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
