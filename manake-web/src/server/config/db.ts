import mongoose from "mongoose";

import { env, isProduction } from "./env";
import { logger } from "../utils/logger";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = env.MONGODB_URI;

    // Debug logging to diagnose why it thinks URI is not set
    if (!mongoUri) {
      console.log(
        "DEBUG: env keys:",
        Object.keys(process.env).filter((k) => k.includes("MONGO")),
      );
      console.log("DEBUG: env.MONGODB_URI from zod:", env.MONGODB_URI);

      if (isProduction) {
        throw new Error("MONGODB_URI must be set in production");
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
