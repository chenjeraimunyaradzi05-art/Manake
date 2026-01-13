/**
 * Security utilities for the Manake platform
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimiters = new Map<string, Map<string, { count: number; resetTime: number }>>();

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based solution
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;
  const limiterKey = `${windowMs}-${maxRequests}`;
  
  if (!rateLimiters.has(limiterKey)) {
    rateLimiters.set(limiterKey, new Map());
  }
  
  const store = rateLimiters.get(limiterKey)!;

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    const now = Date.now();
    const record = store.get(clientId);

    if (!record || record.resetTime < now) {
      store.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.set("Retry-After", String(Math.ceil((record.resetTime - now) / 1000)));
      return res.status(429).json({
        error: "Too many requests",
        message: "Please try again later",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count++;
    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Enable XSS filter
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Content Security Policy (adjust for your needs)
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://api.stripe.com https://*.netlify.app; " +
      "frame-src https://js.stripe.com https://hooks.stripe.com;"
    );
    
    // Strict Transport Security (enable in production with HTTPS)
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    next();
  };
}

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Remove HTML tags from string
   */
  stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, "");
  },

  /**
   * Escape HTML entities
   */
  escapeHtml(input: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return input.replace(/[&<>"']/g, (char) => map[char]);
  },

  /**
   * Sanitize string for MongoDB queries (prevent NoSQL injection)
   */
  sanitizeMongoInput(input: unknown): unknown {
    if (typeof input === "string") {
      // Remove MongoDB operators
      return input.replace(/[${}]/g, "");
    }
    if (Array.isArray(input)) {
      return input.map(sanitize.sanitizeMongoInput);
    }
    if (input && typeof input === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        // Skip keys starting with $ (MongoDB operators)
        if (!key.startsWith("$")) {
          sanitized[key] = sanitize.sanitizeMongoInput(value);
        }
      }
      return sanitized;
    }
    return input;
  },

  /**
   * Validate and sanitize email
   */
  email(input: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = input.trim().toLowerCase();
    return emailRegex.test(trimmed) ? trimmed : null;
  },

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain an uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain a lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain a number");
    }
    
    return { valid: errors.length === 0, errors };
  },
};

/**
 * Request validation middleware
 */
export function validateRequest(schema: {
  body?: Record<string, { required?: boolean; type?: string; maxLength?: number }>;
  params?: Record<string, { required?: boolean; type?: string }>;
  query?: Record<string, { required?: boolean; type?: string }>;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Validate body
    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        
        if (rules.required && (value === undefined || value === null || value === "")) {
          errors.push(`${field} is required`);
          continue;
        }
        
        if (value !== undefined && rules.type) {
          if (rules.type === "string" && typeof value !== "string") {
            errors.push(`${field} must be a string`);
          }
          if (rules.type === "number" && typeof value !== "number") {
            errors.push(`${field} must be a number`);
          }
          if (rules.type === "array" && !Array.isArray(value)) {
            errors.push(`${field} must be an array`);
          }
        }
        
        if (typeof value === "string" && rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
      }
    }

    // Validate params
    if (schema.params) {
      for (const [field, rules] of Object.entries(schema.params)) {
        const value = req.params[field];
        
        if (rules.required && !value) {
          errors.push(`${field} parameter is required`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    next();
  };
}

/**
 * Audit logging for security events
 */
export function auditLog(
  event: string,
  userId: string | null,
  details: Record<string, unknown>,
  req: Request
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    ip: req.ip || req.headers["x-forwarded-for"],
    userAgent: req.headers["user-agent"],
    ...details,
  };

  logger.info("AUDIT", logEntry);
}
