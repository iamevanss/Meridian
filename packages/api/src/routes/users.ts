import { Router } from "express";
import { z } from "zod";
import { prisma } from "@meridian/db";
import { requireAuth, hashPassword, verifyPassword } from "../lib/auth";

export const usersRouter = Router();
usersRouter.use(requireAuth);

function serializeUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phoneNumber: u.phoneNumber,
    dateOfBirth: u.dateOfBirth,
    gender: u.gender,
    hasPin: !!u.pinHash,
  };
}

usersRouter.get("/me", async (req, res) => {
  const { userId } = (req as any).auth;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  res.json({ user: serializeUser(user) });
});

// Profile edits. firstName, lastName, and phoneNumber are deliberately NOT
// accepted here — even if a client sends them, they're silently ignored.
// Real banks lock legal name + phone behind an identity-verification flow;
// we enforce the same boundary here rather than trusting the client to
// simply not send those fields.
const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  dateOfBirth: z.string().refine((v) => !isNaN(Date.parse(v))).optional(),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional(),
});

usersRouter.patch("/me", async (req, res) => {
  const { userId } = (req as any).auth;
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data: any = {};
  if (parsed.data.email) data.email = parsed.data.email;
  if (parsed.data.dateOfBirth) data.dateOfBirth = new Date(parsed.data.dateOfBirth);
  if (parsed.data.gender) data.gender = parsed.data.gender;

  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      return res.status(409).json({ error: "That email is already in use." });
    }
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  res.json({ user: serializeUser(user) });
});

// Password change — requires the current password, standard practice.
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

usersRouter.post("/me/password", async (req, res) => {
  const { userId } = (req as any).auth;
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  res.json({ success: true });
});

// Transaction PIN — set for the first time, or change (requires account password either way).
const setPinSchema = z.object({
  password: z.string(),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

usersRouter.post("/me/pin", async (req, res) => {
  const { userId } = (req as any).auth;
  const parsed = setPinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Password is incorrect." });

  const pinHash = await hashPassword(parsed.data.pin);
  await prisma.user.update({ where: { id: userId }, data: { pinHash } });
  res.json({ success: true });
});
