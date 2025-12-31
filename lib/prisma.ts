import { PrismaClient } from "@prisma/client";

/**
 * Next.js dev/build safe Prisma singleton.
 * Prevents exhausting connections in dev HMR.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
