import { Router } from "express";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, paymentMethodsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const methods = await db.select().from(paymentMethodsTable).orderBy(paymentMethodsTable.name);
    res.json(methods.map(fmt));
  } catch (err) {
    req.log.error({ err }, "listPaymentMethods error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, type, walletAddress, network, qrCode, active = true, instructions } = req.body as {
      name: string; type: string; walletAddress: string; network?: string;
      qrCode?: string; active?: boolean; instructions?: string;
    };
    const [method] = await db.insert(paymentMethodsTable).values({ name, type, walletAddress, network, qrCode, active, instructions }).returning();
    res.status(201).json(fmt(method!));
  } catch (err) {
    req.log.error({ err }, "createPaymentMethod error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const updates: Partial<typeof paymentMethodsTable.$inferInsert> = {};
    const body = req.body as Partial<typeof paymentMethodsTable.$inferInsert>;
    for (const k of ["name","type","walletAddress","network","qrCode","active","instructions"] as const) {
      if (body[k] !== undefined) (updates as Record<string, unknown>)[k] = body[k];
    }
    const [method] = await db.update(paymentMethodsTable).set(updates).where(eq(paymentMethodsTable.id, id)).returning();
    if (!method) { res.status(404).json({ error: "Not found" }); return; }
    res.json(fmt(method));
  } catch (err) {
    req.log.error({ err }, "updatePaymentMethod error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(paymentMethodsTable).where(eq(paymentMethodsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deletePaymentMethod error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function fmt(m: typeof paymentMethodsTable.$inferSelect) {
  return { id: m.id, name: m.name, type: m.type, walletAddress: m.walletAddress, network: m.network, qrCode: m.qrCode, active: m.active, instructions: m.instructions };
}

export default router;
