import { PrismaClient } from "@prisma/client";

// Reuse a single Prisma instance across hot reloads in dev,
// and across serverless invocations where the module is cached.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export * from "@prisma/client";
