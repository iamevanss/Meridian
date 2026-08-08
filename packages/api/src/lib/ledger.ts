import { prisma } from "@meridian/db";
import { randomUUID } from "crypto";

export class InsufficientFundsError extends Error {
  constructor() {
    super("Insufficient funds");
    this.name = "InsufficientFundsError";
  }
}

export class AccountNotFoundError extends Error {
  constructor(accountNumber: string) {
    super(`Account ${accountNumber} not found`);
    this.name = "AccountNotFoundError";
  }
}

export class AccountFrozenError extends Error {
  constructor() {
    super("One or both accounts are frozen or closed");
    this.name = "AccountFrozenError";
  }
}

export class SameAccountError extends Error {
  constructor() {
    super("Cannot transfer to the same account");
    this.name = "SameAccountError";
  }
}

interface TransferParams {
  fromAccountNumber: string;
  toAccountNumber: string;
  amountCents: bigint;
  description: string;
  memo?: string;
}

/**
 * Moves money between two accounts as a single atomic operation.
 *
 * Guarantees:
 *  - Both the debit and credit legs are written, or neither is.
 *  - Balances are only ever mutated inside this transaction, using
 *    row-level locking (SELECT ... FOR UPDATE via Prisma's transaction)
 *    to prevent two simultaneous transfers from racing on the same account.
 *  - Every transfer produces a Transfer record + two linked Transaction rows,
 *    giving a full audit trail.
 */
export async function executeTransfer(params: TransferParams) {
  const { fromAccountNumber, toAccountNumber, amountCents, description, memo } = params;

  if (amountCents <= 0n) {
    throw new Error("Transfer amount must be greater than zero");
  }
  if (fromAccountNumber === toAccountNumber) {
    throw new SameAccountError();
  }

  const transferId = randomUUID();

  return prisma.$transaction(async (tx) => {
    // Lock both account rows for the duration of this transaction.
    // Ordering by account number prevents deadlocks when two transfers
    // touch the same pair of accounts in opposite directions concurrently.
    const [firstNum, secondNum] = [fromAccountNumber, toAccountNumber].sort();

    const accounts = await tx.$queryRawUnsafe<
      { id: string; accountNumber: string; balanceCents: bigint; status: string }[]
    >(
      `SELECT id, "accountNumber", "balanceCents", status FROM "Account"
       WHERE "accountNumber" IN ($1, $2) FOR UPDATE`,
      firstNum,
      secondNum
    );

    const fromAccount = accounts.find((a) => a.accountNumber === fromAccountNumber);
    const toAccount = accounts.find((a) => a.accountNumber === toAccountNumber);

    if (!fromAccount) throw new AccountNotFoundError(fromAccountNumber);
    if (!toAccount) throw new AccountNotFoundError(toAccountNumber);

    if (fromAccount.status !== "ACTIVE" || toAccount.status !== "ACTIVE") {
      throw new AccountFrozenError();
    }

    if (fromAccount.balanceCents < amountCents) {
      throw new InsufficientFundsError();
    }

    const newFromBalance = fromAccount.balanceCents - amountCents;
    const newToBalance = toAccount.balanceCents + amountCents;

    await tx.transfer.create({
      data: {
        id: transferId,
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amountCents,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await tx.account.update({
      where: { id: fromAccount.id },
      data: { balanceCents: newFromBalance },
    });

    await tx.account.update({
      where: { id: toAccount.id },
      data: { balanceCents: newToBalance },
    });

    const debitTx = await tx.transaction.create({
      data: {
        transferId,
        type: "DEBIT",
        amountCents,
        balanceAfterCents: newFromBalance,
        description,
        memo,
        accountId: fromAccount.id,
        counterpartyAccountId: toAccount.id,
      },
    });

    const creditTx = await tx.transaction.create({
      data: {
        transferId,
        type: "CREDIT",
        amountCents,
        balanceAfterCents: newToBalance,
        description,
        memo,
        accountId: toAccount.id,
        counterpartyAccountId: fromAccount.id,
      },
    });

    return { transferId, debitTx, creditTx };
  });
}
