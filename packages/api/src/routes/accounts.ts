import { Router } from "express";
import { prisma } from "@meridian/db";
import { requireAuth } from "../lib/auth";
import { isValidAccountNumber } from "../lib/accountNumber";

export const accountsRouter = Router();
accountsRouter.use(requireAuth);

function serializeAccount(a: any) {
  return { ...a, balanceCents: a.balanceCents.toString() };
}

function serializeTransaction(t: any) {
  return { ...t, amountCents: t.amountCents.toString(), balanceAfterCents: t.balanceAfterCents.toString() };
}

// Looks up the name behind an account number, before a transfer is sent —
// same idea as "Confirm recipient" on real banking apps. Deliberately
// returns the minimum needed to confirm identity (first name + last
// initial), never the full name, email, or any account details.
accountsRouter.get("/lookup/:accountNumber", async (req, res) => {
  const { accountNumber } = req.params;

  if (!isValidAccountNumber(accountNumber)) {
    return res.status(400).json({ error: "Invalid account number" });
  }

  const account = await prisma.account.findUnique({
    where: { accountNumber },
    select: {
      type: true,
      status: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!account) {
    return res.status(404).json({ error: "No account found with that number" });
  }

  return res.json({
    firstName: account.user.firstName,
    lastInitial: account.user.lastName.charAt(0).toUpperCase(),
    accountType: account.type,
    status: account.status,
  });
});

// List the authenticated user's accounts
accountsRouter.get("/", async (req, res) => {
  const { userId } = (req as any).auth;
  const accounts = await prisma.account.findMany({ where: { userId } });
  res.json({ accounts: accounts.map(serializeAccount) });
});

// Transaction history for one of the user's own accounts (ownership enforced)
accountsRouter.get("/:accountId/transactions", async (req, res) => {
  const { userId } = (req as any).auth;
  const { accountId } = req.params;

  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) return res.status(404).json({ error: "Account not found" });

  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const cursor = req.query.cursor as string | undefined;

  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  res.json({
    transactions: transactions.map(serializeTransaction),
    nextCursor: transactions.length === limit ? transactions[transactions.length - 1].id : null,
  });
});
