import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add a Neon Postgres connection string to .env.local (or Vercel env vars).",
    );
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

/**
 * Lazy Prisma client proxy. The real client is constructed on first property
 * access, so `import { db } from "@/lib/db"` does not throw when
 * DATABASE_URL is missing at module-evaluation time (important for Next.js
 * route data collection during `next build`).
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance =
      globalForPrisma.prisma ??
      (globalForPrisma.prisma = createClient());
    const value = Reflect.get(instance, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
}) as PrismaClient;
