/**
 * Request Logging Middleware
 * Logs incoming requests and response times
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Request logging middleware
 * Logs request details and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate or use existing request ID
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logFn = res.statusCode >= 400 ? logger.warn.bind(logger) : logger.info.bind(logger);

    logFn('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

/**
 * Sensitive data masking for logging
 */
export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  const masked = { ...data };

  for (const key of Object.keys(masked)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key] as Record<string, unknown>);
    }
  }

  return masked;
}
