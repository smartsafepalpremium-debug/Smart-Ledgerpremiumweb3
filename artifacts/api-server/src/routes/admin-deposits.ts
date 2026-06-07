import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, depositsTable, usersTable, transactionsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";
import { sendDepositEmail } from "../lib/email";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query["page"] ?? 1);
    const limit = 20;
    const status = req.query["status"] as string | undefined;
    const offset = (page - 1) * limit;

    const where = status ? eq(depositsTable.status, status) : undefined;

    const [deposits, totalResult] = await Promise.all([
      db.select({
        deposit: depositsTable,
        userEmail: usersTable.email,
        userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      }).from(depositsTable)
        .leftJoin(usersTable, eq(depositsTable.userId, usersTable.id))
        .where(where).limit(limit).offset(offset)
        .orderBy(sql`${depositsTable.createdAt} desc`),
      db.select({ count: count() }).from(depositsTable).where(where),
    ]);

    res.json({
      deposits: deposits.map(r => formatDeposit(r.deposit, r.userEmail, r.userName)),
      total: Number(totalResult[0]!.count),
      page,
    });
  } catch (err) {
    req.log.error({ err }, "listDeposits error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const [row] = await db.select({
      deposit: depositsTable,
      userEmail: usersTable.email,
      userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
    }).from(depositsTable).leftJoin(usersTable, eq(depositsTable.userId, usersTable.id)).where(eq(depositsTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatDeposit(row.deposit, row.userEmail, row.userName));
  } catch (err) {
    req.log.error({ err }, "getDeposit error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const note = (req.body as { note?: string }).note;
    const [dep] = await db.update(depositsTable).set({ status: "approved", adminNote: note ?? null }).where(eq(depositsTable.id, id)).returning();
    if (!dep) { res.status(404).json({ error: "Not found" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dep.userId));
    if (user) {
      await db.update(usersTable).set({ balance: (user.balance ?? 0) + dep.amount }).where(eq(usersTable.id, user.id));
      await db.insert(transactionsTable).values({
        userId: user.id, type: "deposit", amount: dep.amount, status: "completed",
        description: `Deposit via ${dep.method} approved`,
      });
      await sendDepositEmail(user.email, `${user.firstName} ${user.lastName}`, dep.amount, "approved", note);
    }
    res.json(formatDeposit(dep, user?.email ?? null, user ? `${user.firstName} ${user.lastName}` : null));
  } catch (err) {
    req.log.error({ err }, "approveDeposit error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const note = (req.body as { note?: string }).note;
    const [dep] = await db.update(depositsTable).set({ status: "rejected", adminNote: note ?? null }).where(eq(depositsTable.id, id)).returning();
    if (!dep) { res.status(404).json({ error: "Not found" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dep.userId));
    if (user) {
      await sendDepositEmail(user.email, `${user.firstName} ${user.lastName}`, dep.amount, "rejected", note);
    }
    res.json(formatDeposit(dep, user?.email ?? null, user ? `${user.firstName} ${user.lastName}` : null));
  } catch (err) {
    req.log.error({ err }, "rejectDeposit error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatDeposit(d: typeof depositsTable.$inferSelect, email: string | null, name: string | null) {
  return {
    id: d.id, userId: d.userId, userEmail: email, userName: name,
    amount: d.amount, method: d.method, txHash: d.txHash, status: d.status,
    adminNote: d.adminNote, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
  };
}

export default router;
