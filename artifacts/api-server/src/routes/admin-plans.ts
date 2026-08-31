import { Router } from "express";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, plansTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response) => {
  try {
    const plans = await db.select().from(plansTable).orderBy(plansTable.minAmount);
    res.json(plans.map(formatPlan));
  } catch (err) {
    req.log.error({ err }, "listPlans error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, minAmount, maxAmount, roiPercent, description, active = true } = req.body as {
      name: string; minAmount: number; maxAmount: number; roiPercent: number;
      description?: string; active?: boolean;
    };
    const [plan] = await db.insert(plansTable).values({ name, minAmount, maxAmount, roiPercent, durationDays: 30, description, active }).returning();
    res.status(201).json(formatPlan(plan!));
  } catch (err) {
    req.log.error({ err }, "createPlan error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    const updates: Partial<typeof plansTable.$inferInsert> = {};
    const body = req.body as Partial<typeof plansTable.$inferInsert>;
    for (const k of ["name","minAmount","maxAmount","description","active"] as const) {
      if (body[k] !== undefined) (updates as Record<string, unknown>)[k] = body[k];
    }
    updates.durationDays = 30;
    const [plan] = await db.update(plansTable).set(updates).where(eq(plansTable.id, id)).returning();
    if (!plan) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatPlan(plan));
  } catch (err) {
    req.log.error({ err }, "updatePlan error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(plansTable).where(eq(plansTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deletePlan error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatPlan(p: typeof plansTable.$inferSelect) {
  return { id: p.id, name: p.name, minAmount: p.minAmount, maxAmount: p.maxAmount, roiPercent: p.roiPercent, durationDays: 30, description: p.description, active: p.active };
}

export default router;
