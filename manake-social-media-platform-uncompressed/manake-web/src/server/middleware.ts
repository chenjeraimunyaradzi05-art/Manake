import type { ErrorRequestHandler, Request, RequestHandler } from "express";
import { logger } from "./utils/logger";
import { normalizeOrigin } from "./config/origins";

const isStateChangingMethod = (method: string): boolean => !["GET", "HEAD", "OPTIONS"].includes(method);

export const securityHeaders = (): RequestHandler => (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
};

export const csrfOriginCheck = (allowedOrigins: string[]): RequestHandler => (req, res, next) => {
  if (process.env.NODE_ENV !== "production" || !isStateChangingMethod(req.method)) {
    next();
    return;
  }

  const requestOrigin = normalizeOrigin(req.get("origin") ?? req.get("referer"));

  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
    next();
    return;
  }

  res.status(403).json({ error: "Request origin is not allowed" });
};

export const sanitizeRequest: RequestHandler = (_req, _res, next) => {
  next();
};

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info("API request completed", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
};

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req: Request, res, _next) => {
  void _next;

  const statusCode = typeof error === "object" && error !== null && "statusCode" in error
    ? Number((error as { statusCode?: unknown }).statusCode)
    : 500;

  const message = error instanceof Error ? error.message : "Unexpected server error";

  logger.error("API request failed", {
    message,
    statusCode,
  });

  res.status(Number.isInteger(statusCode) && statusCode >= 400 ? statusCode : 500).json({
    error: statusCode >= 500 ? "Internal server error" : message,
  });
};
