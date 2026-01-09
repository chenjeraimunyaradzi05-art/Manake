import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter for serverless environments
 * For production, consider using Redis or a dedicated rate limiting service
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

interface RateLimitOptions {
  windowMs?: number;  // Time window in milliseconds
  max?: number;       // Max requests per window
  message?: string;   // Error message
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Rate limiting middleware factory
 */
export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60000, // 1 minute default
    max = 10,         // 10 requests per window default
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${keyGenerator(req)}:${req.path}`;
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

    if (entry.count > max) {
      return res.status(429).json({ message });
    }

    next();
  };
};

/**
 * Stricter rate limit for sensitive operations
 */
export const strictRateLimit = rateLimit({
  windowMs: 60000,  // 1 minute
  max: 5,           // 5 requests per minute
  message: 'Rate limit exceeded. Please wait before trying again.',
});

/**
 * Rate limit for like actions (prevent spam)
 */
export const likeRateLimit = rateLimit({
  windowMs: 60000,  // 1 minute
  max: 20,          // 20 likes per minute
  message: 'Too many likes. Please slow down.',
});

/**
 * Rate limit for contact form submissions
 */
export const contactRateLimit = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 3,           // 3 submissions per 5 minutes
  message: 'Too many contact submissions. Please wait before trying again.',
});
