import { Router } from "express";
import { z } from "zod";
import { prisma } from "@meridian/db";
import { hashPassword, verifyPassword, signCustomerToken, signAdminToken } from "../lib/auth";
import { generateUniqueAccountNumber } from "../lib/accountNumber";

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, firstName, lastName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await hashPassword(password);

  // Create the user and their first checking account together.
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      accounts: {
        create: {
          accountNumber: await generateUniqueAccountNumber(),
          type: "CHECKING",
          nickname: "Everyday Checking",
          // Seed with a friendly demo balance so the dashboard isn't empty ($1,000.00)
          balanceCents: 100000n,
        },
      },
    },
    include: { accounts: true },
  });

  const token = signCustomerToken({ userId: user.id, role: "CUSTOMER" });
  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    accounts: user.accounts.map(serializeAccount),
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signCustomerToken({ userId: user.id, role: "CUSTOMER" });
  return res.json({
    token,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
  });
});

// Separate endpoint + separate token secret from customer login.
authRouter.post("/admin/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN" || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  const token = signAdminToken({ userId: user.id, role: "ADMIN" });
  return res.json({
    token,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
  });
});

function serializeAccount(a: { balanceCents: bigint; [key: string]: any }) {
  return { ...a, balanceCents: a.balanceCents.toString() };
}
