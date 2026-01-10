/**
 * Security Headers Middleware
 * Additional security headers beyond what Helmet provides
 */
import { Request, Response, NextFunction } from "express";

/**
 * Security headers configuration options
 */
interface SecurityHeadersOptions {
  enableCSP?: boolean;
  enablePermissionsPolicy?: boolean;
  customHeaders?: Record<string, string>;
}

/**
 * Enhanced security headers middleware
 */
export const securityHeaders = (options: SecurityHeadersOptions = {}) => {
  const {
    enableCSP = true,
    enablePermissionsPolicy = true,
    customHeaders = {},
  } = options;

  return (_req: Request, res: Response, next: NextFunction): void => {
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");

    // XSS Protection (for older browsers)
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy (basic API policy)
    if (enableCSP) {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; frame-ancestors 'none'",
      );
    }

    // Permissions Policy (disable unnecessary browser features for API)
    if (enablePermissionsPolicy) {
      res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()",
      );
    }

    // Remove powered by header (already done by Helmet, but just in case)
    res.removeHeader("X-Powered-By");

    // Custom headers
    for (const [key, value] of Object.entries(customHeaders)) {
      res.setHeader(key, value);
    }

    next();
  };
};

/**
 * CORS preflight handler with caching
 */
export const corsPreflightHandler = (maxAge: number = 86400) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Max-Age", maxAge.toString());
      res.status(204).end();
      return;
    }
    next();
  };
};

/**
 * Request sanitization middleware
 * Removes potentially dangerous characters from request data
 */
export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        // Remove null bytes
        let clean = value.replace(/\0/g, "");
        // Remove common script injection patterns
        clean = clean.replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          "",
        );
        sanitized[key] = clean;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === "object" && item !== null
            ? sanitize(item as Record<string, unknown>)
            : item,
        );
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitize(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  };

  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }

  if (req.query && typeof req.query === "object") {
    req.query = sanitize(
      req.query as Record<string, unknown>,
    ) as typeof req.query;
  }

  next();
};

/**
 * API Key validation middleware
 * Validates X-API-Key header for mobile app access
 */
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const apiKey = req.headers["x-api-key"] as string;
  const validApiKey = process.env.API_KEY;

  // Skip API key validation in development or if not configured
  if (process.env.NODE_ENV === "development" || !validApiKey) {
    next();
    return;
  }

  if (!apiKey) {
    res.status(401).json({
      error: {
        code: "MISSING_API_KEY",
        message: "API key is required",
      },
    });
    return;
  }

  if (apiKey !== validApiKey) {
    res.status(403).json({
      error: {
        code: "INVALID_API_KEY",
        message: "Invalid API key",
      },
    });
    return;
  }

  next();
};
