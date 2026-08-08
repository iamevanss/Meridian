import { Router } from "express";
import { prisma } from "@meridian/db";
import { requireAuth } from "../lib/auth";

export const accountsRouter = Router();
accountsRouter.use(requireAuth);

function serializeAccount(a: any) {
  return { ...a, balanceCents: a.balanceCents.toString() };
}

function serializeTransaction(t: any) {
  return { ...t, amountCents: t.amountCents.toString(), balanceAfterCents: t.balanceAfterCents.toString() };
}

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
