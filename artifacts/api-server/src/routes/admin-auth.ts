import { Router } from "express";
import type { Request, Response } from "express";
import { ADMIN_EMAIL, ADMIN_PASSWORD, generateAdminToken, requireAdmin, verifyAdminToken } from "../middlewares/auth";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateAdminToken();
  res.json({ token, admin: { email: ADMIN_EMAIL, role: "admin" } });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ success: true });
});

router.get("/me", requireAdmin, (req: Request, res: Response) => {
  const header = req.headers.authorization!;
  const token = header.slice(7);
  const payload = verifyAdminToken(token);
  res.json({ email: payload!.email, role: payload!.role });
});

export default router;
