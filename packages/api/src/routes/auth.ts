import { Router } from "express";
import { z } from "zod";
import { prisma } from "@meridian/db";
import { hashPassword, verifyPassword, signCustomerToken, signAdminToken } from "../lib/auth";
import { generateUniqueAccountNumber } from "../lib/accountNumber";
import { createNotification } from "../lib/notifications";

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
  phoneNumber: z.string().min(7, "Enter a valid phone number"),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Conditions to create an account." }) }),
});

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, firstName, lastName, dateOfBirth, phoneNumber, gender } = parsed.data;

  // Basic age check — must be 18+ to open an account, same as any real bank
  const dob = new Date(dateOfBirth);
  const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 18) {
    return res.status(400).json({ error: "You must be at least 18 years old to open an account" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await hashPassword(password);

  // Create the user and both starter accounts together — real banks give
  // you a checking + savings pair by default, so we do too.
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      dateOfBirth: dob,
      phoneNumber,
      gender,
      termsAcceptedAt: new Date(),
      accounts: {
        create: [
          {
            accountNumber: await generateUniqueAccountNumber(),
            type: "CHECKING",
            nickname: "Everyday Checking",
            balanceCents: 100000n, // demo seed: $1,000.00
          },
          {
            accountNumber: await generateUniqueAccountNumber(),
            type: "SAVINGS",
            nickname: "High-Yield Savings",
            balanceCents: 500000n, // demo seed: $5,000.00
          },
        ],
      },
    },
    include: { accounts: true },
  });

  await createNotification(
    user.id,
    "WELCOME",
    `Welcome to Meridian, ${firstName}`,
    "Your Checking and Savings accounts are ready. Before you get started, please take a moment to review our Terms & Conditions.",
    { actionLabel: "View Terms & Conditions", actionUrl: "/terms" }
  );

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
