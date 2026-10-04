import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const configuredJwtSecret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
if (!configuredJwtSecret) {
  throw new Error("JWT_SECRET or SESSION_SECRET must be configured.");
}
const JWT_SECRET: string = configuredJwtSecret;
const ADMIN_EMAIL = "smartsafepalpremium@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function generateAdminToken(): string {
  return jwt.sign({ email: ADMIN_EMAIL, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): { email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string; role: string };
  } catch {
    return null;
  }
}

export function generateUserToken(userId: number, email: string): string {
  return jwt.sign({ userId, email, role: "user" }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyUserToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  const payload = verifyAdminToken(token);
  if (!payload || payload.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as Request & { admin: typeof payload }).admin = payload;
  next();
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  const payload = verifyUserToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as Request & { user: typeof payload }).user = payload;
  next();
}

export { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET };
