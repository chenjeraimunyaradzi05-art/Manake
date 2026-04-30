import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;
let databaseReady = false;

export const isDatabaseConfigured = (): boolean => Boolean(process.env.DATABASE_URL);

export const getPrisma = (): PrismaClient => {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
};

export const connectDB = async (): Promise<PrismaClient> => {
  const client = getPrisma();
  await client.$connect();
  databaseReady = true;
  return client;
};

export const isDatabaseReady = (): boolean => databaseReady;

export const getDatabaseHealth = () => ({
  configured: isDatabaseConfigured(),
  ready: isDatabaseReady(),
});
