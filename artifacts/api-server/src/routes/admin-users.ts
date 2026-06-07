import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq, ilike, or, sql, count } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";
import { nanoid } from "../lib/nanoid";

const router = Router();

router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query["page"] ?? 1);
    const limit = Number(req.query["limit"] ?? 20);
    const search = req.query["search"] as string | undefined;
    const offset = (page - 1) * limit;

    const where = search
      ? or(ilike(usersTable.email, `%${search}%`), ilike(usersTable.firstName, `%${search}%`), ilike(usersTable.lastName, `%${search}%`))
      : undefined;

    const [users, totalResult] = await Promise.all([
      db.select().from(usersTable).where(where).limit(limit).offset(offset).orderBy(sql`${usersTable.createdAt} desc`),
      db.select({ count: count() }).from(usersTable).where(where),
    ]);

    res.json({ users: users.map(safeUser), total: Number(totalResult[0]!.count), page, limit });
  } catch (err) {
    req.log.error({ err }, "listUsers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password, phone, country, balance = 0, profit = 0 } = req.body as {
      email: string; firstName: string; lastName: string; password: string;
      phone?: string; country?: string; balance?: number; profit?: number;
    };
    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = nanoid(8).toUpperCase();
    const [user] = await db.insert(usersTable).values({
      email, firstName, lastName, passwordHash, phone, country,
      balance, profit, referralCode,
    }).returning();
    res.status(201).json(safeUser(user!));
  } catch (err) {
    req.log.error({ err }, "createUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json(safeUser(user));
  } catch (err) {
    req.log.error({ err }, "getUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const { firstName, lastName, phone, country, balance, profit, status } = req.body as {
      firstName?: string; lastName?: string; phone?: string; country?: string;
      balance?: number; profit?: number; status?: string;
    };
    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (balance !== undefined) updates.balance = balance;
    if (profit !== undefined) updates.profit = profit;
    if (status !== undefined) updates.status = status;

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(safeUser(updated));
  } catch (err) {
    req.log.error({ err }, "updateUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/suspend", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const { suspended } = req.body as { suspended: boolean };
    const [updated] = await db.update(usersTable)
      .set({ suspended, status: suspended ? "suspended" : "active" })
      .where(eq(usersTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(safeUser(updated));
  } catch (err) {
    req.log.error({ err }, "suspendUser error");
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
