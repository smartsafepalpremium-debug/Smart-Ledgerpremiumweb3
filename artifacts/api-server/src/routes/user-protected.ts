import { Router } from "express";
import type { Request, Response } from "express";
import { eq, desc, and } from "drizzle-orm";
import {
  db, usersTable, depositsTable, withdrawalsTable, transactionsTable,
  loansTable, plansTable, paymentMethodsTable, investmentsTable,
} from "@workspace/db";
import { requireUser } from "../middlewares/auth";

const router = Router();

type AuthedReq = Request & { user: { userId: number; email: string; role: string } };

// GET /user/me
router.get("/me", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(safeUser(user));
  } catch (err) {
    req.log.error({ err }, "getUserMe error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /user/me
router.patch("/me", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  const { firstName, lastName, phone, country } = req.body as {
    firstName?: string; lastName?: string; phone?: string; country?: string;
  };
  try {
    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;

    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
    res.json(safeUser(user!));
  } catch (err) {
    req.log.error({ err }, "updateUserMe error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/transactions
router.get("/transactions", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  try {
    const rows = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(100);
    res.json(rows.map(t => ({
      id: t.id, userId: t.userId, type: t.type, amount: t.amount,
      status: t.status, description: t.description,
      createdAt: t.createdAt.toISOString(),
      userEmail: null,
    })));
  } catch (err) {
    req.log.error({ err }, "getUserTransactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/deposits
router.get("/deposits", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  try {
    const rows = await db.select().from(depositsTable)
      .where(eq(depositsTable.userId, userId))
      .orderBy(desc(depositsTable.createdAt))
      .limit(100);
    res.json(rows.map(d => ({
      id: d.id, userId: d.userId, amount: d.amount, method: d.method,
      txHash: d.txHash, status: d.status, adminNote: d.adminNote,
      createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
      userEmail: null, userName: null,
    })));
  } catch (err) {
    req.log.error({ err }, "getUserDeposits error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/withdrawals
router.get("/withdrawals", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  try {
    const rows = await db.select().from(withdrawalsTable)
      .where(eq(withdrawalsTable.userId, userId))
      .orderBy(desc(withdrawalsTable.createdAt))
      .limit(100);
    res.json(rows.map(w => ({
      id: w.id, userId: w.userId, amount: w.amount, method: w.method,
      walletAddress: w.walletAddress, status: w.status, adminNote: w.adminNote,
      createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString(),
      userEmail: null, userName: null,
    })));
  } catch (err) {
    req.log.error({ err }, "getUserWithdrawals error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/loans
router.get("/loans", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  try {
    const rows = await db.select().from(loansTable)
      .where(eq(loansTable.userId, userId))
      .orderBy(desc(loansTable.createdAt));
    res.json(rows.map(l => ({
      id: l.id, userId: l.userId, amount: l.amount, purpose: l.purpose,
      status: l.status, adminNote: l.adminNote,
      createdAt: l.createdAt.toISOString(),
      userEmail: null, userName: null,
    })));
  } catch (err) {
    req.log.error({ err }, "getUserLoans error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /user/loans
router.post("/loans", async (req: Request, res: Response) => {
  const { userId, amount, purpose } = req.body as { userId: number; amount: number; purpose: string };
  try {
    const [loan] = await db.insert(loansTable).values({ userId, amount, purpose }).returning();
    res.status(201).json({
      id: loan!.id, userId: loan!.userId, amount: loan!.amount,
      purpose: loan!.purpose, status: loan!.status, adminNote: loan!.adminNote,
      createdAt: loan!.createdAt.toISOString(),
      userEmail: null, userName: null,
    });
  } catch (err) {
    req.log.error({ err }, "applyForLoan error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /user/invest
router.post("/invest", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  const { planId, amount } = req.body as { planId: number; amount: number };
  try {
    if (!planId || !amount || amount <= 0) {
      res.status(400).json({ error: "Invalid investment request" }); return;
    }
    const [plan] = await db.select().from(plansTable).where(and(eq(plansTable.id, planId), eq(plansTable.active, true)));
    if (!plan) { res.status(400).json({ error: "Plan not found or inactive" }); return; }
    if (amount < plan.minAmount) {
      res.status(400).json({ error: `Minimum investment is $${plan.minAmount}` }); return;
    }
    if (plan.maxAmount && amount > plan.maxAmount) {
      res.status(400).json({ error: `Maximum investment is $${plan.maxAmount}` }); return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    if ((user.balance ?? 0) < amount) {
      res.status(400).json({ error: "Insufficient balance" }); return;
    }
    const maturesAt = new Date();
    maturesAt.setDate(maturesAt.getDate() + plan.durationDays);
    const expectedReturn = Math.round(amount * (1 + plan.roiPercent / 100) * 100) / 100;

    const [investment] = await db.insert(investmentsTable).values({
      userId,
      planId: plan.id,
      planName: plan.name,
      amount,
      roiPercent: plan.roiPercent,
      durationDays: plan.durationDays,
      expectedReturn,
      status: "active",
      maturesAt,
    }).returning();

    await db.update(usersTable).set({ balance: (user.balance ?? 0) - amount }).where(eq(usersTable.id, userId));
    await db.insert(transactionsTable).values({
      userId,
      type: "investment",
      amount: -amount,
      status: "completed",
      description: `Invested in ${plan.name} plan`,
    });

    res.status(201).json({
      id: investment!.id, userId: investment!.userId, planId: investment!.planId,
      planName: investment!.planName, amount: investment!.amount, roiPercent: investment!.roiPercent,
      durationDays: investment!.durationDays, expectedReturn: investment!.expectedReturn,
      status: investment!.status, maturesAt: investment!.maturesAt.toISOString(),
      createdAt: investment!.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "createInvestment error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/investments
router.get("/investments", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  try {
    const rows = await db.select().from(investmentsTable)
      .where(eq(investmentsTable.userId, userId))
      .orderBy(desc(investmentsTable.createdAt));
    res.json(rows.map(inv => ({
      id: inv.id, userId: inv.userId, planId: inv.planId, planName: inv.planName,
      amount: inv.amount, roiPercent: inv.roiPercent, durationDays: inv.durationDays,
      expectedReturn: inv.expectedReturn, status: inv.status,
      maturesAt: inv.maturesAt.toISOString(), createdAt: inv.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "getUserInvestments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/plans
router.get("/plans", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(plansTable).where(eq(plansTable.active, true));
    res.json(rows.map(p => ({
      id: p.id, name: p.name, minAmount: p.minAmount, maxAmount: p.maxAmount,
      roiPercent: p.roiPercent, durationDays: p.durationDays,
      description: p.description, active: p.active,
    })));
  } catch (err) {
    _req.log.error({ err }, "getUserPlans error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/payment-methods
router.get("/payment-methods", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.active, true));
    res.json(rows.map(pm => ({
      id: pm.id, name: pm.name, type: pm.type, walletAddress: pm.walletAddress,
      network: pm.network, qrCode: pm.qrCode, active: pm.active,
      instructions: pm.instructions,
    })));
  } catch (err) {
    _req.log.error({ err }, "getUserPaymentMethods error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /user/portfolio
router.get("/portfolio", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const [deposits, withdrawals, loans] = await Promise.all([
      db.select().from(depositsTable).where(eq(depositsTable.userId, userId)),
      db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, userId)),
      db.select().from(loansTable).where(eq(loansTable.userId, userId)),
    ]);

    const totalDeposited = deposits
      .filter(d => d.status === "approved")
      .reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawn = withdrawals
      .filter(w => w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);
    const activeLoans = loans.filter(l => l.status === "approved").length;
    const pendingDeposits = deposits.filter(d => d.status === "pending").length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

    res.json({
      balance: user.balance ?? 0,
      profit: user.profit ?? 0,
      totalDeposited,
      totalWithdrawn,
      activeLoans,
      pendingDeposits,
      pendingWithdrawals,
    });
  } catch (err) {
    req.log.error({ err }, "getUserPortfolio error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /user/kyc
router.post("/kyc", async (req: Request, res: Response) => {
  const { userId, documentType, documentNumber, country } = req.body as {
    userId: number; documentType: string; documentNumber: string; country?: string;
  };
  try {
    const updates: Partial<typeof usersTable.$inferInsert> = { status: "verified" };
    if (country) updates.country = country;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
    res.json(safeUser(user!));
  } catch (err) {
    req.log.error({ err }, "submitKyc error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function safeUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName,
    phone: u.phone, country: u.country, balance: u.balance, profit: u.profit,
    status: u.status, referralCode: u.referralCode, referredBy: u.referredBy,
    createdAt: u.createdAt.toISOString(),
  };
}

export default router;
