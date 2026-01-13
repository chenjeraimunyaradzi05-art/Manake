/**
 * Authentication Controller
 * Thin controller layer that delegates to AuthService
 * Handles HTTP request/response concerns only
 */
import { Request, Response } from "express";
import { authService } from "../services/authService";
import { TokenPayload } from "../utils/jwt";

/**
 * User login
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const result = await authService.login(
    { email, password },
    {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    },
  );

  res.json({
    message: "Login successful",
    user: result.user,
    ...result.tokens,
  });
};

/**
 * User registration
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, phone } = req.body;

  const result = await authService.register(
    { email, password, name, phone },
    {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    },
  );

  res.status(201).json({
    message: "Registration successful",
    user: result.user,
    ...result.tokens,
  });
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { refreshToken: token } = req.body;

  const tokens = await authService.refreshToken(token, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  res.json({
    message: "Token refreshed",
    ...tokens,
  });
};

/**
 * User logout
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const tokenUser = req.user as TokenPayload;

  await authService.logout(tokenUser.userId);

  res.json({ message: "Logged out successfully" });
};

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const tokenUser = req.user as TokenPayload;

  const user = await authService.getProfile(tokenUser.userId);

  res.json(user);
};

/**
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const tokenUser = req.user as TokenPayload;
  const { name, phone } = req.body;

  const user = await authService.updateProfile(tokenUser.userId, { name, phone });

  res.json({
    message: "Profile updated",
    user,
  });
};

/**
 * Request password reset
 * POST /api/v1/auth/password-reset/request
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  await authService.requestPasswordReset(email);

  res.json({
    message:
      "If an account with that email exists, a password reset link has been sent",
  });
};

/**
 * Reset password
 * POST /api/v1/auth/password-reset
 */
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token, password } = req.body;

  await authService.resetPassword(token, password);

  res.json({ message: "Password reset successful" });
};

/**
 * Verify email
 * POST /api/v1/auth/verify-email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body;

  await authService.verifyEmail(token);

  res.json({ message: "Email verified successfully" });
};

/**
 * Request email verification
 * POST /api/v1/auth/request-verification
 */
export const requestEmailVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const tokenUser = req.user as TokenPayload;

  await authService.requestEmailVerification(tokenUser.userId);

  res.json({ message: "Verification email sent" });
};

/**
 * Change password (authenticated)
 * POST /api/v1/auth/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const tokenUser = req.user as TokenPayload;
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(tokenUser.userId, currentPassword, newPassword);

  res.json({ message: "Password changed successfully" });
};
