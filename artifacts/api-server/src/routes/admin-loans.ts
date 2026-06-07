import { Router } from "express";
import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, loansTable, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";
import { sendLoanEmail } from "../lib/email";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query["status"] as string | undefined;
    const where = status ? eq(loansTable.status, status) : undefined;

    const loans = await db.select({
      loan: loansTable,
      userEmail: usersTable.email,
      userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
    }).from(loansTable)
      .leftJoin(usersTable, eq(loansTable.userId, usersTable.id))
      .where(where).orderBy(sql`${loansTable.createdAt} desc`);

    res.json(loans.map(r => formatLoan(r.loan, r.userEmail, r.userName)));
  } catch (err) {
    req.log.error({ err }, "listLoans error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const note = (req.body as { note?: string }).note;
    const [loan] = await db.update(loansTable).set({ status: "approved", adminNote: note ?? null }).where(eq(loansTable.id, id)).returning();
    if (!loan) { res.status(404).json({ error: "Not found" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, loan.userId));
    if (user) {
      await db.update(usersTable).set({ balance: (user.balance ?? 0) + loan.amount }).where(eq(usersTable.id, user.id));
      await sendLoanEmail(user.email, `${user.firstName} ${user.lastName}`, loan.amount, "approved", note);
    }
    res.json(formatLoan(loan, user?.email ?? null, user ? `${user.firstName} ${user.lastName}` : null));
  } catch (err) {
    req.log.error({ err }, "approveLoan error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const note = (req.body as { note?: string }).note;
    const [loan] = await db.update(loansTable).set({ status: "rejected", adminNote: note ?? null }).where(eq(loansTable.id, id)).returning();
    if (!loan) { res.status(404).json({ error: "Not found" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, loan.userId));
    if (user) await sendLoanEmail(user.email, `${user.firstName} ${user.lastName}`, loan.amount, "rejected", note);
    res.json(formatLoan(loan, user?.email ?? null, user ? `${user.firstName} ${user.lastName}` : null));
  } catch (err) {
    req.log.error({ err }, "rejectLoan error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatLoan(l: typeof loansTable.$inferSelect, email: string | null, name: string | null) {
  return { id: l.id, userId: l.userId, userEmail: email, userName: name, amount: l.amount, purpose: l.purpose, status: l.status, adminNote: l.adminNote, createdAt: l.createdAt.toISOString() };
}

export default router;
