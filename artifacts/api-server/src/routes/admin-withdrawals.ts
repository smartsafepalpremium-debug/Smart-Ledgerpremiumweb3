import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, withdrawalsTable, usersTable, transactionsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";
import { sendWithdrawalEmail } from "../lib/email";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query["page"] ?? 1);
    const limit = 20;
    const status = req.query["status"] as string | undefined;
    const offset = (page - 1) * limit;

    const where = status ? eq(withdrawalsTable.status, status) : undefined;

    const [withdrawals, totalResult] = await Promise.all([
      db.select({
        withdrawal: withdrawalsTable,
        userEmail: usersTable.email,
        userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      }).from(withdrawalsTable)
        .leftJoin(usersTable, eq(withdrawalsTable.userId, usersTable.id))
        .where(where).limit(limit).offset(offset)
        .orderBy(sql`${withdrawalsTable.createdAt} desc`),
      db.select({ count: count() }).from(withdrawalsTable).where(where),
    ]);

    res.json({
      withdrawals: withdrawals.map(r => formatWithdrawal(r.withdrawal, r.userEmail, r.userName)),
      total: Number(totalResult[0]!.count),
      page,
    });
  } catch (err) {
    req.log.error({ err }, "listWithdrawals error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const [row] = await db.select({
      withdrawal: withdrawalsTable,
      userEmail: usersTable.email,
      userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
    }).from(withdrawalsTable).leftJoin(usersTable, eq(withdrawalsTable.userId, usersTable.id)).where(eq(withdrawalsTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatWithdrawal(row.withdrawal, row.userEmail, row.userName));
  } catch (err) {
    req.log.error({ err }, "getWithdrawal error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const note = (req.body as { note?: string }).note;
    const [w] = await db.update(withdrawalsTable).set({ status: "approved", adminNote: note ?? null }).where(eq(withdrawalsTable.id, id)).returning();
    if (!w) { res.status(404).json({ error: "Not found" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, w.userId));
    if (user) {
      await db.update(usersTable).set({ balance: Math.max(0, (user.balance ?? 0) - w.amount) }).where(eq(usersTable.id, user.id));
      await db.insert(transactionsTable).values({
        userId: user.id, type: "withdrawal", amount: w.amount, status: "completed",
        description: `Withdrawal via ${w.method} approved`,
      });
      await sendWithdrawalEmail(user.email, `${user.firstName} ${user.lastName}`, w.amount, "approved", note);
    }
    res.json(formatWithdrawal(w, user?.email ?? null, user ? `${user.firstName} ${user.lastName}` : null));
  } catch (err) {
    req.log.error({ err }, "approveWithdrawal error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const note = (req.body as { note?: string }).note;
    const [w] = await db.update(withdrawalsTable).set({ status: "rejected", adminNote: note ?? null }).where(eq(withdrawalsTable.id, id)).returning();
    if (!w) { res.status(404).json({ error: "Not found" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, w.userId));
    if (user) {
      await sendWithdrawalEmail(user.email, `${user.firstName} ${user.lastName}`, w.amount, "rejected", note);
    }
    res.json(formatWithdrawal(w, user?.email ?? null, user ? `${user.firstName} ${user.lastName}` : null));
  } catch (err) {
    req.log.error({ err }, "rejectWithdrawal error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatWithdrawal(w: typeof withdrawalsTable.$inferSelect, email: string | null, name: string | null) {
  return {
    id: w.id, userId: w.userId, userEmail: email, userName: name,
    amount: w.amount, method: w.method, walletAddress: w.walletAddress,
    status: w.status, adminNote: w.adminNote,
    createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString(),
  };
}

export default router;
