import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

export interface AuthPayload {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signCustomerToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

export function signAdminToken(payload: AuthPayload) {
  // Separate secret from customer tokens — an admin token can never be
  // forged or reused by decoding a customer token, and vice versa.
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: "12h" });
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

// Requires a valid customer OR admin token; attaches req.auth
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as any).auth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Requires a valid admin token, signed with the SEPARATE admin secret.
// A regular customer token — even for a user with role ADMIN in the DB —
// will not pass this check unless it was actually issued via /admin/login.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as AuthPayload;
    if (payload.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }
    (req as any).auth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
}
