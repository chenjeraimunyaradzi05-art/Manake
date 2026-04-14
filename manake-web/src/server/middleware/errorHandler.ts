/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */
import { Request, Response, NextFunction } from "express";
import { ApiError, isApiError, ValidationError, ServiceUnavailableError } from "../errors";
import { markDatabaseUnready } from "../config/db";
import { logger } from "../utils/logger";

/**
 * Error response interface for consistent API responses
 */
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  requestId?: string;
}

/**
 * Async handler wrapper to catch async errors
 * Eliminates need for try-catch in every route handler
 */
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Parse MongoDB errors into ApiError
 */
function handleMongoError(
  error: Error & { code?: number; keyPattern?: Record<string, unknown> },
): ApiError {
  // Duplicate key error
  if (error.code === 11000 && error.keyPattern) {
    const field = Object.keys(error.keyPattern)[0];
    return new ValidationError(
      [{ field, message: `${field} already exists` }],
      "Duplicate entry",
    );
  }

  // Validation error from Mongoose
  if (error.name === "ValidationError") {
    const mongooseError = error as Error & {
      errors: Record<string, { message: string }>;
    };
    const errors = Object.entries(mongooseError.errors).map(([field, err]) => ({
      field,
      message: err.message,
    }));
    return new ValidationError(errors);
  }

  // Cast error (invalid ObjectId, etc.)
  if (error.name === "CastError") {
    return new ApiError("Invalid ID format", 400, "INVALID_ID");
  }

  return new ApiError("Database error", 500, "DATABASE_ERROR");
}

/**
 * Parse JWT errors into ApiError
 */
function handleJWTError(error: Error): ApiError {
  if (error.name === "JsonWebTokenError") {
    return new ApiError("Invalid token", 401, "INVALID_TOKEN");
  }
  if (error.name === "TokenExpiredError") {
    return new ApiError("Token expired", 401, "TOKEN_EXPIRED");
  }
  return new ApiError("Authentication failed", 401, "AUTH_FAILED");
}

/**
 * Main error handler middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Explicitly mark next as unused while preserving Express signature
  void _next;
  // Generate request ID for tracking
  const requestId =
    (req.headers["x-request-id"] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  let apiError: ApiError;

  // Normalise non-Error throwables so the rest of the handler never crashes
  const normalizedErr: Error =
    err instanceof Error ? err : new Error(String(err ?? "Unknown error"));

  // Detect Prisma connection/query errors and mark DB as unready
  const prismaCode =
    (err as { code?: string; clientVersion?: string }).code;
  const isPrismaError = Boolean(
    (err as { clientVersion?: string }).clientVersion,
  );
  const prismaConnectionCodes = new Set(["P1001", "P1002", "P1008", "P1017"]);
  if (isPrismaError && prismaCode && prismaConnectionCodes.has(prismaCode)) {
    markDatabaseUnready();
  }

  // Convert known error types to ApiError
  if (isApiError(err)) {
    apiError = err;
  } else if (isPrismaError) {
    // Prisma known request errors (P2xxx = data errors)
    if (prismaCode === "P2002") {
      apiError = new ValidationError(
        [{ field: "unknown", message: "A record with that value already exists" }],
        "Duplicate entry",
      );
    } else if (prismaCode === "P2025") {
      apiError = new ApiError("Record not found", 404, "NOT_FOUND");
    } else if (prismaCode && prismaConnectionCodes.has(prismaCode)) {
      apiError = new ServiceUnavailableError(
        "Database is temporarily unavailable. Please try again in a moment.",
      );
    } else {
      apiError = new ApiError(
        process.env.NODE_ENV === "production" ? "Database error" : (normalizedErr.message),
        500,
        "DATABASE_ERROR",
      );
    }
  } else if (
    normalizedErr.name === "MongoError" ||
    normalizedErr.name === "ValidationError" ||
    normalizedErr.name === "CastError"
  ) {
    apiError = handleMongoError(
      normalizedErr as Error & { code?: number; keyPattern?: Record<string, unknown> },
    );
  } else if (
    normalizedErr.name === "JsonWebTokenError" ||
    normalizedErr.name === "TokenExpiredError"
  ) {
    apiError = handleJWTError(normalizedErr);
  } else if (normalizedErr.name === "SyntaxError" && "body" in normalizedErr) {
    // JSON parse error
    apiError = new ApiError(
      "Invalid JSON in request body",
      400,
      "INVALID_JSON",
    );
  } else {
    // Unknown error - don't leak details in production
    apiError = new ApiError(
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : normalizedErr.message,
      500,
      "INTERNAL_ERROR",
    );
  }

  // Log the error
  const logData = {
    requestId,
    method: req.method,
    path: req.path,
    statusCode: apiError.statusCode,
    code: apiError.code,
    message: apiError.message,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };

  if (apiError.statusCode >= 500) {
    logger.error("Server Error", { ...logData, stack: normalizedErr.stack });
  } else if (apiError.statusCode >= 400) {
    logger.warn("Client Error", logData);
  }

  // Build error response
  const response: ErrorResponse = {
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details && { details: apiError.details }),
      // Include stack trace in development
      ...(process.env.NODE_ENV === "development" && { stack: normalizedErr.stack }),
    },
    requestId,
  };

  // Set response headers
  res.setHeader("X-Request-Id", requestId);

  // Handle rate limit errors specially
  if (apiError.code === "RATE_LIMIT_EXCEEDED") {
    const retryAfter =
      (apiError as ApiError & { retryAfter?: number }).retryAfter || 60;
    res.setHeader("Retry-After", retryAfter.toString());
  }

  res.status(apiError.statusCode).json(response);
};

/**
 * 404 Not Found handler
 * Use for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ErrorResponse = {
    error: {
      code: "NOT_FOUND",
      message: `Cannot ${req.method} ${req.path}`,
    },
  };
  res.status(404).json(response);
};
