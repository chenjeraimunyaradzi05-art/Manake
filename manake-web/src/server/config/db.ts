import mongoose from "mongoose";

import { env, isProduction } from "./env";
import { logger } from "../utils/logger";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Accept Railway's auto-injected MONGO_URL as well as the conventional MONGODB_URI
    const mongoUri = env.MONGODB_URI || env.MONGO_URL || process.env.MONGO_URL;

    if (!mongoUri) {
      if (isProduction) {
        throw new Error(
          "No MongoDB URI found. Set MONGODB_URI or MONGO_URL (Railway injects MONGO_URL automatically).",
        );
      }

      logger.warn("MONGODB_URI not set; skipping MongoDB connection", {
        env: process.env.NODE_ENV,
      });
      return;
    }

    const db = await mongoose.connect(mongoUri);
    isConnected = !!db.connections[0].readyState;
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection error", { error });
    // Don't exit process in serverless, just throw or log
    throw error;
  }
};
