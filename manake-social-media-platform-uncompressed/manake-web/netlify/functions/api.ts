import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, isDatabaseReady } from "../../src/server/config/db";
import {
  csrfOriginCheck,
  errorHandler,
  notFoundHandler,
  requestLogger,
  sanitizeRequest,
  securityHeaders,
} from "../../src/server/middleware";
import apiRoutes from "../../src/server/routes";
import { logger } from "../../src/server/utils/logger";
import { getAllowedOrigins, normalizeOrigin } from "../../src/server/config/origins";

// Load env vars
dotenv.config();

const app = express();
app.set("trust proxy", 1);
let dbConnectInFlight = false;

const allowedOrigins = getAllowedOrigins();

const warmDatabaseConnection = (): void => {
  if (dbConnectInFlight || isDatabaseReady()) {
    return;
  }

  dbConnectInFlight = true;
  void connectDB()
    .catch((error: unknown) => {
      logger.warn("Background database warmup failed in Netlify function", {
        message: error instanceof Error ? error.message : String(error),
      });
    })
    .finally(() => {
      dbConnectInFlight = false;
    });
};

// Security middleware
app.use(helmet());
app.use(securityHeaders());

// CORS configuration - restrict origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

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

app.use(csrfOriginCheck(allowedOrigins));

// Body parsing with size limit
app.use(
  express.json({
    limit: "10kb",
    verify: (req, res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      void res;
    },
  }),
);

app.use(sanitizeRequest);
app.use(requestLogger);

// Warm the Prisma connection opportunistically, but never block the request.
// Route handlers already perform fail-fast readiness checks that return JSON
// errors instead of letting the function time out and surface as a 502.
app.use((_req, _res, next) => {
  warmDatabaseConnection();
  next();
});

// Mount routes at root - Netlify redirects /api/* to /.netlify/functions/api/*
// So a request to /api/stories becomes /.netlify/functions/api/stories
// The :splat captures "stories" and passes it to our handler
app.use("/", apiRoutes);

// Also mount at /api for direct function invocation
app.use("/api", apiRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dbReady: isDatabaseReady(),
    env: process.env.NODE_ENV,
    apiBase: "/api",
    frontendOriginConfigured: Boolean(process.env.FRONTEND_URL),
    oauthConfigured: {
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebook: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

// Export the handler for Netlify Functions
export const handler = serverless(app);
