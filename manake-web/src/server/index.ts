/**
 * Local development server for the Manake API
 * Run with: npm run dev:server
 * This starts Express on port 3001 which Vite proxies to
 */
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";

// Load environment variables explicitly from .env file
dotenv.config({ path: path.join(process.cwd(), ".env") });

import { connectDB } from "./config/db";
import { ensureProductionEnv } from "./config/env";
import apiRoutes from "./routes";
import { initSocketIO } from "./socket";
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  securityHeaders,
  sanitizeRequest,
  csrfOriginCheck,
} from "./middleware";
import { logger } from "./utils/logger";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO
const io = initSocketIO(httpServer);
// Make io available in routes via req.app.get('io') or similar if needed,
// or simply use the singleton pattern/export if established.
// For now, attaching to app locals is a good pattern.
app.set("io", io);

// Security middleware
app.use(helmet());
app.use(securityHeaders());

// CORS configuration - restrict in production
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL || "https://manake.org.zw"]
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      // In development, be more permissive to avoid CORS issues
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// CSRF-style origin checks for state-changing requests
app.use(csrfOriginCheck(allowedOrigins));

// Body parsing
app.use(express.json({ limit: "10kb" })); // Limit body size

// Request sanitization
app.use(sanitizeRequest);

// Request logging
app.use(requestLogger);

// API Routes - mounted at /api to match Vite proxy config
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    ensureProductionEnv();

    // Connect to MongoDB
    await connectDB();

    httpServer.listen(PORT, () => {
      logger.info("Server started", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
      });
      logger.info("Manake API listening", {
        url: `http://localhost:${PORT}`,
        health: `http://localhost:${PORT}/health`,
        api: `http://localhost:${PORT}/api`,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

startServer();
