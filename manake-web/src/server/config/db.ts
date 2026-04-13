import { prisma } from "./prisma";
import { isProduction } from "./env";
import { logger } from "../utils/logger";

export const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
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
    logger.info("PostgreSQL connected via Prisma");
  } catch (error) {
    logger.error("Database connection error", { error });
    throw error;
  }
};
