/**
 * JWT Token Utilities
 * Handles token generation, verification, and refresh
 */
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors';
import crypto from 'crypto';

// Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role?: 'user' | 'admin' | 'moderator';
  iat?: number;
  exp?: number;
}

// Refresh token payload
interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// Token response interface
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Get secret from environment with fallback for development
const getAccessSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return secret || 'dev-secret-change-in-production';
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }
  return secret || 'dev-refresh-secret-change-in-production';
};

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

/**
 * Generate an access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, getAccessSecret(), options);
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(userId: string): string {
  const tokenId = crypto.randomUUID();
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId,
    tokenId,
  };

  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, getRefreshSecret(), options);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: { id: string; email: string; role?: string }): TokenPair {
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: (user.role as TokenPayload['role']) || 'user',
  });

  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  };
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, getAccessSecret()) as JwtPayload & TokenPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, getRefreshSecret()) as JwtPayload & RefreshTokenPayload;
    return {
      userId: decoded.userId,
      tokenId: decoded.tokenId,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
}

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token present, but doesn't require it
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
    } catch {
      // Token invalid but not required - continue without user
    }
  }

  next();
};

/**
 * Role-based authorization middleware
 * Use after authenticate middleware
 */
export const authorize = (...allowedRoles: Array<'user' | 'admin' | 'moderator'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userRole = req.user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

/**
 * Hash a refresh token for storage (don't store raw tokens)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Compare a token with its hash
 */
export function compareTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}
