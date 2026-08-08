import { Router } from "express";
import { z } from "zod";
import { prisma } from "@meridian/db";
import { requireAdmin } from "../lib/auth";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

function serializeAccount(a: any) {
  return { ...a, balanceCents: a.balanceCents.toString() };
}

// Every route below writes an AdminAction row — nothing here is silent.
async function logAdminAction(actorId: string, actionType: string, targetType: string, targetId: string, details: object) {
  await prisma.adminAction.create({
    data: { actorId, actionType, targetType, targetId, details },
  });
}

// System-wide account list, with basic filters
adminRouter.get("/accounts", async (req, res) => {
  const status = req.query.status as string | undefined;
  const accounts = await prisma.account.findMany({
    where: status ? { status: status as any } : undefined,
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ accounts: accounts.map(serializeAccount) });
});

// System-wide transaction feed, most recent first
adminRouter.get("/transactions", async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { account: { select: { accountNumber: true } } },
  });
  res.json({
    transactions: transactions.map((t) => ({
      ...t,
      amountCents: t.amountCents.toString(),
      balanceAfterCents: t.balanceAfterCents.toString(),
    })),
  });
});

const freezeSchema = z.object({ accountId: z.string().uuid(), reason: z.string().min(1) });

adminRouter.post("/accounts/freeze", async (req, res) => {
  const parsed = freezeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { accountId, reason } = parsed.data;
  const { userId } = (req as any).auth;

  const account = await prisma.account.update({
    where: { id: accountId },
    data: { status: "FROZEN" },
  });

  await logAdminAction(userId, "FREEZE_ACCOUNT", "Account", accountId, { reason });
  res.json({ account: serializeAccount(account) });
});

adminRouter.post("/accounts/unfreeze", async (req, res) => {
  const parsed = freezeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { accountId, reason } = parsed.data;
  const { userId } = (req as any).auth;

  const account = await prisma.account.update({
    where: { id: accountId },
    data: { status: "ACTIVE" },
  });

  await logAdminAction(userId, "UNFREEZE_ACCOUNT", "Account", accountId, { reason });
  res.json({ account: serializeAccount(account) });
});

// Manual balance adjustment — for demo seeding / support corrections only.
// Deliberately NOT a transfer: it creates a single transaction row with no
// counterparty, clearly distinguishable in the ledger from real transfers.
const adjustSchema = z.object({
  accountId: z.string().uuid(),
  amountDollars: z.number(), // positive = credit, negative = debit
  reason: z.string().min(1),
});

adminRouter.post("/accounts/adjust-balance", async (req, res) => {
  const parsed = adjustSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { accountId, amountDollars, reason } = parsed.data;
  const { userId } = (req as any).auth;
  const amountCents = BigInt(Math.round(amountDollars * 100));

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.account.findUniqueOrThrow({ where: { id: accountId } });
    const newBalance = account.balanceCents + amountCents;

    const updated = await tx.account.update({
      where: { id: accountId },
      data: { balanceCents: newBalance },
    });

    await tx.transaction.create({
      data: {
        transferId: `admin-adj-${Date.now()}`,
        type: amountCents >= 0n ? "CREDIT" : "DEBIT",
        amountCents: amountCents < 0n ? -amountCents : amountCents,
        balanceAfterCents: newBalance,
        description: `Admin balance adjustment: ${reason}`,
        accountId,
      },
    });

    return updated;
  });

  await logAdminAction(userId, "ADJUST_BALANCE", "Account", accountId, { amountDollars, reason });
  res.json({ account: serializeAccount(result) });
});

// Read-only audit trail of admin actions
adminRouter.get("/audit-log", async (req, res) => {
  const actions = await prisma.adminAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { email: true, firstName: true, lastName: true } } },
  });
  res.json({ actions });
});
