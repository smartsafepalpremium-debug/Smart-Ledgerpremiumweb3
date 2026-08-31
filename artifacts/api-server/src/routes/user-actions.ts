import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { and, eq, sum } from "drizzle-orm";
import {
  db, usersTable, depositsTable, withdrawalsTable,
  referralsTable, settingsTable,
} from "@workspace/db";
import { generateUserToken } from "../middlewares/auth";
import { requireUser } from "../middlewares/auth";
import { nanoid } from "../lib/nanoid";
import { accrueUserInvestments } from "../lib/investment-accrual";
import {
  sendWelcomeEmail, sendDepositRequestToAdmin,
  sendWithdrawalRequestToAdmin,
  sendUserMessageToAdmin,
} from "../lib/email";

const router = Router();
type AuthedReq = Request & { user: { userId: number; email: string; role: string } };

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, country, referralCode: refCode } = req.body as {
      email: string; password: string; firstName: string; lastName: string;
      phone?: string; country?: string; referralCode?: string;
    };

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) { res.status(400).json({ error: "Email already registered" }); return; }

    const [settings] = await db.select().from(settingsTable).limit(1);
    const welcomeBonus = settings?.welcomeBonus ?? 0;
    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = nanoid(8).toUpperCase();

    let referrer: typeof usersTable.$inferSelect | undefined;
    if (refCode) {
      const [r] = await db.select().from(usersTable).where(eq(usersTable.referralCode, refCode));
      referrer = r;
    }

    const [user] = await db.insert(usersTable).values({
      email, passwordHash, firstName, lastName, phone, country,
      balance: welcomeBonus, referralCode, referredBy: referrer?.referralCode ?? null,
    }).returning();

    if (referrer && user) {
      const bonusPct = settings?.referralBonusPercent ?? 5;
      const bonus = Math.round(welcomeBonus * bonusPct) / 100;
      await db.insert(referralsTable).values({ referrerId: referrer.id, referredId: user.id, bonusAmount: bonus });
      if (bonus > 0) {
        await db.update(usersTable).set({ balance: (referrer.balance ?? 0) + bonus }).where(eq(usersTable.id, referrer.id));
      }
    }

    await sendWelcomeEmail(user!.email, `${user!.firstName} ${user!.lastName}`, user!.referralCode);

    const token = generateUserToken(user!.id, user!.email);
    res.status(201).json({ token, user: safeUser(user!) });
  } catch (err) {
    req.log.error({ err }, "registerUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }
    if (user.suspended) { res.status(403).json({ error: "Account suspended" }); return; }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
    await accrueUserInvestments(user.id);
    const [refreshedUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
    const token = generateUserToken(user.id, user.email);
    res.json({ token, user: safeUser(refreshedUser ?? user) });
  } catch (err) {
    req.log.error({ err }, "loginUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contact-message", requireUser, async (req: Request, res: Response) => {
  const { userId } = (req as AuthedReq).user;
  const { subject, message } = req.body as { subject?: unknown; message?: unknown };

  if (typeof subject !== "string" || typeof message !== "string") {
    res.status(400).json({ error: "Enter a subject and message" });
    return;
  }

  const cleanSubject = subject.trim().replace(/[\r\n]+/g, " ");
  const cleanMessage = message.trim();
  if (cleanSubject.length < 3 || cleanSubject.length > 120) {
    res.status(400).json({ error: "Subject must be between 3 and 120 characters" });
    return;
  }
  if (cleanMessage.length < 1 || cleanMessage.length > 5000) {
    res.status(400).json({ error: "Message must be between 1 and 5,000 characters" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [settings] = await db.select().from(settingsTable).limit(1);
    const adminEmail = settings?.adminEmail?.trim() || "smartsafepalpremium@gmail.com";
    const sent = await sendUserMessageToAdmin(
      adminEmail,
      `${user.firstName} ${user.lastName}`,
      user.email,
      cleanSubject,
      cleanMessage,
    );

    if (!sent) {
      res.status(503).json({ error: "Message could not be sent right now. Please try again later." });
      return;
    }

    res.status(202).json({ success: true });
  } catch (err) {
    req.log.error({ err, userId }, "sendUserContactMessage error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/deposit", async (req: Request, res: Response) => {
  try {
    const { userId, amount, method, txHash } = req.body as { userId: number; amount: number; method: string; txHash?: string };
    const [dep] = await db.insert(depositsTable).values({ userId, amount, method, txHash }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const [settings] = await db.select().from(settingsTable).limit(1);
    const adminEmail = settings?.adminEmail ?? "smartsafepalpremium@gmail.com";
    if (user) {
      await sendDepositRequestToAdmin(adminEmail, `${user.firstName} ${user.lastName}`, user.email, amount, method);
    }
    res.status(201).json({ id: dep!.id, userId: dep!.userId, amount: dep!.amount, method: dep!.method, txHash: dep!.txHash, status: dep!.status, adminNote: dep!.adminNote, createdAt: dep!.createdAt.toISOString(), updatedAt: dep!.updatedAt.toISOString(), userEmail: user?.email ?? null, userName: user ? `${user.firstName} ${user.lastName}` : null });
  } catch (err) {
    req.log.error({ err }, "submitDeposit error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/withdraw", requireUser, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as AuthedReq).user;
    const { amount, method, walletAddress } = req.body as { amount: number; method: string; walletAddress: string };
    await accrueUserInvestments(userId);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    if (!Number.isFinite(amount) || amount <= 0 || !method || !walletAddress) {
      res.status(400).json({ error: "Enter a valid withdrawal amount, method, and wallet address" }); return;
    }
    const [pending] = await db
      .select({ total: sum(withdrawalsTable.amount) })
      .from(withdrawalsTable)
      .where(and(eq(withdrawalsTable.userId, userId), eq(withdrawalsTable.status, "pending")));
    const pendingAmount = Number(pending?.total ?? 0);
    const withdrawableBalance = Math.max(0, (user.balance ?? 0) - pendingAmount);
    if (amount > withdrawableBalance) {
      res.status(400).json({
        error: `Insufficient withdrawable balance. Available: $${withdrawableBalance.toFixed(2)}`,
      }); return;
    }
    const [w] = await db.insert(withdrawalsTable).values({ userId, amount, method, walletAddress }).returning();
    const [settings] = await db.select().from(settingsTable).limit(1);
    const adminEmail = settings?.adminEmail ?? "smartsafepalpremium@gmail.com";
    if (user) {
      await sendWithdrawalRequestToAdmin(adminEmail, `${user.firstName} ${user.lastName}`, user.email, amount, method);
    }
    res.status(201).json({ id: w!.id, userId: w!.userId, amount: w!.amount, method: w!.method, walletAddress: w!.walletAddress, status: w!.status, adminNote: w!.adminNote, createdAt: w!.createdAt.toISOString(), updatedAt: w!.updatedAt.toISOString(), userEmail: user?.email ?? null, userName: user ? `${user.firstName} ${user.lastName}` : null });
  } catch (err) {
    req.log.error({ err }, "submitWithdrawal error");
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
