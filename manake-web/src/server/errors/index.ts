/**
 * Custom Error Classes for Manake API
 * Provides structured error handling with proper HTTP status codes
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * 400 - Bad Request Error
 * Use for invalid request data, malformed JSON, etc.
 */
export class BadRequestError extends ApiError {
  constructor(
    message: string = "Bad request",
    details?: Record<string, unknown>,
  ) {
    super(message, 400, "BAD_REQUEST", details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 - Unauthorized Error
 * Use when authentication is required but not provided or invalid
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 - Forbidden Error
 * Use when user is authenticated but not allowed to access resource
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 - Not Found Error
 * Use when a requested resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND", { resource });
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 - Conflict Error
 * Use for duplicate entries, version conflicts, etc.
 */
export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 - Validation Error
 * Use for semantic errors in request data
 */
export class ValidationError extends ApiError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    errors: Array<{ field: string; message: string }>,
    message: string = "Validation failed",
  ) {
    super(message, 422, "VALIDATION_ERROR", { errors });
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 429 - Too Many Requests Error
 * Use when rate limit is exceeded
 */
export class TooManyRequestsError extends ApiError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60, message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT_EXCEEDED", { retryAfter });
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

/**
 * 500 - Internal Server Error
 * Use for unexpected errors
 */
export class InternalServerError extends ApiError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * 502 - Bad Gateway Error
 * Use when an external service fails
 */
export class BadGatewayError extends ApiError {
  constructor(service: string, message?: string) {
    super(message || `External service error: ${service}`, 502, "BAD_GATEWAY", {
      service,
    });
    Object.setPrototypeOf(this, BadGatewayError.prototype);
  }
}

/**
 * 503 - Service Unavailable Error
 * Use when the service is temporarily unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = "Service temporarily unavailable") {
    super(message, 503, "SERVICE_UNAVAILABLE");
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Database Error
 * Use for MongoDB/database-related errors
 */
export class DatabaseError extends ApiError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, "DATABASE_ERROR");
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * External Service Error
 * Use for third-party API errors (Stripe, social media, etc.)
 */
export class ExternalServiceError extends ApiError {
  public readonly service: string;

  constructor(service: string, message?: string, statusCode: number = 502) {
    super(
      message || `${service} service error`,
      statusCode,
      "EXTERNAL_SERVICE_ERROR",
      { service },
    );
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if an error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isOperational;
  }
  return false;
}
