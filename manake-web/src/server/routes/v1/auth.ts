/**
 * Authentication Routes - API v1
 */
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import {
  validate,
  loginSchema,
  registerSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "../../middleware/validation";
import { strictRateLimit } from "../../middleware/rateLimit";
import { authenticate } from "../../utils/jwt";
import {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
} from "../../controllers/authController";

const router = Router();

// Public routes
router.post(
  "/login",
  strictRateLimit,
  validate(loginSchema, "body"),
  asyncHandler(login),
);

router.post(
  "/register",
  strictRateLimit,
  validate(registerSchema, "body"),
  asyncHandler(register),
);

router.post("/refresh", asyncHandler(refreshToken));

router.post(
  "/password-reset/request",
  strictRateLimit,
  validate(passwordResetRequestSchema, "body"),
  asyncHandler(requestPasswordReset),
);

router.post(
  "/password-reset",
  strictRateLimit,
  validate(passwordResetSchema, "body"),
  asyncHandler(resetPassword),
);

// Protected routes
router.post("/logout", authenticate, asyncHandler(logout));
router.get("/profile", authenticate, asyncHandler(getProfile));
router.patch("/profile", authenticate, asyncHandler(updateProfile));

export default router;
