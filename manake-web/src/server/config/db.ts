import { prisma } from "./prisma";
import { isProduction } from "./env";
import { ServiceUnavailableError } from "../errors";
import { logger } from "../utils/logger";

let databaseReady = false;

export const isDatabaseReady = (): boolean => databaseReady;

const DB_READY_TIMEOUT_MS = 2000;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Database readiness check timed out"));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    databaseReady = false;
    if (isProduction) {
      throw new Error(
        "DATABASE_URL is not set. Add a PostgreSQL database in Railway and set DATABASE_URL.",
      );
    }
    logger.warn("DATABASE_URL not set; skipping database connection", {
      env: process.env.NODE_ENV,
    });
    return;
  }

  try {
    await prisma.$connect();
    databaseReady = true;
    logger.info("PostgreSQL connected via Prisma");
  } catch (error) {
    databaseReady = false;
    logger.error("Database connection error", { error });
    throw error;
  }
};

export const ensureDatabaseReady = async (): Promise<void> => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    databaseReady = false;
    throw new ServiceUnavailableError(
      "Database is not configured. Please contact support.",
    );
  }

  if (databaseReady) {
    return;
  }

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, DB_READY_TIMEOUT_MS);
    databaseReady = true;
  } catch (error) {
    databaseReady = false;
    logger.warn("Database unavailable during request", {
      message: error instanceof Error ? error.message : String(error),
    });
    throw new ServiceUnavailableError(
      "Database is temporarily unavailable. Please try again in a moment.",
    );
  }
};
