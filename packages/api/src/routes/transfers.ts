import { Router } from "express";
import { z } from "zod";
import { prisma } from "@meridian/db";
import { requireAuth, verifyPassword } from "../lib/auth";
import {
  executeTransfer,
  InsufficientFundsError,
  AccountNotFoundError,
  AccountFrozenError,
  SameAccountError,
} from "../lib/ledger";
import { isValidAccountNumber } from "../lib/accountNumber";
import { createNotification } from "../lib/notifications";

export const transfersRouter = Router();
transfersRouter.use(requireAuth);

const transferSchema = z.object({
  fromAccountId: z.string().uuid(), // internal id of one of the caller's own accounts
  toAccountNumber: z.string().length(10),
  amountDollars: z.number().positive(),
  description: z.string().min(1).max(140),
  memo: z.string().max(280).optional(),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

transfersRouter.post("/", async (req, res) => {
  const { userId } = (req as any).auth;
  const parsed = transferSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { fromAccountId, toAccountNumber, amountDollars, description, memo, pin } = parsed.data;

  // Every transfer requires the transaction PIN, verified fresh on every
  // request — this is a separate secret from the account password, so a
  // logged-in session alone is never enough to move money.
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.pinHash) {
    return res.status(428).json({ error: "Please set a transaction PIN before sending money." });
  }
  const pinValid = await verifyPassword(pin, user.pinHash);
  if (!pinValid) {
    return res.status(401).json({ error: "Incorrect PIN." });
  }

  if (!isValidAccountNumber(toAccountNumber)) {
    return res.status(400).json({ error: "Destination account number is invalid" });
  }

  // Ownership check: the source account MUST belong to the authenticated user.
  const fromAccount = await prisma.account.findFirst({
    where: { id: fromAccountId, userId },
  });
  if (!fromAccount) {
    return res.status(403).json({ error: "You do not own the source account" });
  }

  const amountCents = BigInt(Math.round(amountDollars * 100));

  try {
    const result = await executeTransfer({
      fromAccountNumber: fromAccount.accountNumber,
      toAccountNumber,
      amountCents,
      description,
      memo,
    });

    const dollarsLabel = amountDollars.toLocaleString("en-US", { style: "currency", currency: "USD" });

    // Notify the sender and, if the recipient is also a Meridian user, notify them too.
    await createNotification(
      userId,
      "TRANSFER_SENT",
      "Money sent",
      `You sent ${dollarsLabel} to account •••• ${toAccountNumber.slice(-4)}.`
    );

    const toAccount = await prisma.account.findUnique({
      where: { accountNumber: toAccountNumber },
      select: { userId: true },
    });
    if (toAccount) {
      await createNotification(
        toAccount.userId,
        "TRANSFER_RECEIVED",
        "Money received",
        `You received ${dollarsLabel} from account •••• ${fromAccount.accountNumber.slice(-4)}.`
      );
    }

    return res.status(201).json({
      transferId: result.transferId,
      newBalanceCents: result.debitTx.balanceAfterCents.toString(),
    });
  } catch (err) {
    if (err instanceof InsufficientFundsError) return res.status(422).json({ error: err.message });
    if (err instanceof AccountNotFoundError) return res.status(404).json({ error: err.message });
    if (err instanceof AccountFrozenError) return res.status(423).json({ error: err.message });
    if (err instanceof SameAccountError) return res.status(400).json({ error: err.message });
    console.error("Transfer failed:", err);
    return res.status(500).json({ error: "Transfer failed. Please try again." });
  }
});
