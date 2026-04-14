import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Append connection timeout to the DATABASE_URL so Prisma fails fast
 * instead of hanging indefinitely when the DB is unreachable.
 * A hung Prisma query causes Railway's reverse proxy to return 502.
 */
function withConnectionTimeout(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "10");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

// Singleton pattern — reuse the same client in development (hot reload)
export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    datasourceUrl: withConnectionTimeout(process.env.DATABASE_URL),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
