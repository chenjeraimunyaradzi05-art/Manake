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
import { fileURLToPath } from "url";

// Load environment variables explicitly from .env file
dotenv.config({ path: path.join(process.cwd(), ".env") });

// ESM __dirname equivalent
const __serverFilename = fileURLToPath(import.meta.url);
const __serverDir = path.dirname(__serverFilename);
// dist is at ../../dist relative to src/server/index.ts
const distPath = path.resolve(__serverDir, "../../dist");

import { connectDB, isDatabaseReady } from "./config/db";
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
const DB_RETRY_DELAY_MS = 15000;
const productionStartupOptionalEnv = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "STRIPE_SECRET_KEY",
] as const;

const serializeError = (error: unknown): Record<string, unknown> =>
  error instanceof Error
    ? {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }
    : { error };

const logStartupEnvWarnings = (): void => {
  if (process.env.NODE_ENV !== "production") return;

  const missing = productionStartupOptionalEnv.filter(
    (key) => !process.env[key],
  );

  if (missing.length > 0) {
    logger.warn(
      "Production environment variables missing; some features may be unavailable until configured",
      { missing },
    );
  }
};

const normalizeOrigin = (value: string | undefined): string | null => {
  if (!value) {
    return null;
  }

  try {
    const normalizedValue = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;
    return new URL(normalizedValue).origin.toLowerCase();
  } catch {
    return null;
  }
};

let dbRetryTimer: ReturnType<typeof setTimeout> | null = null;
let dbConnectAttempt = 0;

const scheduleDatabaseReconnect = (): void => {
  if (dbRetryTimer) {
    return;
  }

  dbRetryTimer = setTimeout(() => {
    dbRetryTimer = null;
    void connectDatabaseWithRetry();
  }, DB_RETRY_DELAY_MS);

  logger.warn("Scheduling database reconnect attempt", {
    retryInMs: DB_RETRY_DELAY_MS,
  });
};

const connectDatabaseWithRetry = async (): Promise<void> => {
  dbConnectAttempt += 1;

  try {
    await connectDB();
    dbConnectAttempt = 0;
  } catch (error) {
    logger.error(
      dbConnectAttempt === 1
        ? "Initial database connection failed after server startup"
        : "Database reconnect attempt failed",
      serializeError(error),
    );
    scheduleDatabaseReconnect();
  }
};

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
const productionAllowedOrigins = Array.from(
  new Set(
    [
      process.env.FRONTEND_URL,
      process.env.RAILWAY_STATIC_URL,
      process.env.RAILWAY_PUBLIC_DOMAIN,
      "https://manake.org.zw",
      "https://www.manake.org.zw",
    ]
      .map((value) => normalizeOrigin(value))
      .filter((value): value is string => Boolean(value)),
  ),
);
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? productionAllowedOrigins
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

      const normalizedOrigin = normalizeOrigin(origin);
      if (normalizedOrigin && allowedOrigins.includes(normalizedOrigin)) {
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
app.use(
  express.json({
    limit: "10kb",
    verify: (req, res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      void res;
    },
  }),
); // Limit body size

// Request sanitization
app.use(sanitizeRequest);

// Request logging
app.use(requestLogger);

// API Routes - mounted at /api to match Vite proxy config
app.use("/api", apiRoutes);

// Health check endpoint
const SERVER_START_TIME = new Date().toISOString();
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    startedAt: SERVER_START_TIME,
    commit: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    dbReady: isDatabaseReady(),
    env: process.env.NODE_ENV,
  });
});

// Serve React frontend in production (after API routes, before 404)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));
  // SPA fallback — serve index.html for all non-API routes (React Router)
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    logStartupEnvWarnings();

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

    void connectDatabaseWithRetry();
  } catch (error) {
    logger.error("Failed to start server", serializeError(error));
    process.exit(1);
  }
};

startServer();
