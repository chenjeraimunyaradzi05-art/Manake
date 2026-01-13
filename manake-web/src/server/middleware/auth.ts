/**
 * Auth Middleware
 * Convenience exports for authentication and authorization
 */

import { Request, Response, NextFunction } from "express";
import { authenticate, authorize, optionalAuth } from "../utils/jwt";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { User } from "../models/User";

// Re-export JWT auth utilities
export { authenticate, authorize, optionalAuth };

// Alias for clarity
export const requireAuth = authenticate;

/**
 * Require specific role(s) - more readable syntax
 */
export const requireRole = (roles: Array<"user" | "admin" | "moderator">) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userRole = req.user.role || "user";

    if (!roles.includes(userRole)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole(["admin"]);

/**
 * Require moderator or admin role
 */
export const requireModerator = requireRole(["admin", "moderator"]);

/**
 * Require that the authenticated user's email is verified.
 * Admin/moderator are allowed to bypass.
 */
export const requireEmailVerified = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const role = req.user.role || "user";
  if (role === "admin" || role === "moderator") {
    return next();
  }

  const user = await User.findById(req.user.userId).select("isEmailVerified");
  if (!user?.isEmailVerified) {
    throw new ForbiddenError("Email verification required");
  }

  next();
};
