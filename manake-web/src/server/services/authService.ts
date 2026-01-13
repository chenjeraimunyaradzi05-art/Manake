/**
 * Authentication Service
 * Handles core authentication business logic
 * Extracted from authController for better testability and reusability
 */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  generateTokenPair,
  hashToken,
  verifyRefreshToken,
} from "../utils/jwt";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../errors";
import { User, IUser, UserRole } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { emailService } from "./emailService";
import { logger } from "../utils/logger";

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: Partial<IUser>;
  tokens: TokenPair;
}

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
}

class AuthService {
  private readonly MAX_FAILED_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Authenticate user with email and password
   */
  async login(
    credentials: LoginCredentials,
    deviceInfo?: DeviceInfo,
  ): Promise<AuthResult> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // passwordHash is select:false, so we must explicitly include it
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash +failedLoginAttempts +lockoutUntil",
    );

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const now = new Date();
    if (user.lockoutUntil && user.lockoutUntil.getTime() > now.getTime()) {
      throw new UnauthorizedError(
        "Account temporarily locked. Please try again later.",
      );
    }

    const isPasswordValid = await user.comparePassword(String(password));
    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      user.failedLoginAttempts = attempts;
      if (attempts >= this.MAX_FAILED_LOGIN_ATTEMPTS) {
        user.failedLoginAttempts = 0;
        user.lockoutUntil = new Date(now.getTime() + this.LOCKOUT_DURATION_MS);
      }
      await user.save();
      throw new UnauthorizedError("Invalid email or password");
    }

    // Reset lockout state on successful login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.createTokenPair(user, deviceInfo);

    logger.info("User logged in", { userId: user._id, email: user.email });

    return {
      user: user.toPublicJSON(),
      tokens,
    };
  }

  /**
   * Register a new user
   */
  async register(
    data: RegisterData,
    deviceInfo?: DeviceInfo,
  ): Promise<AuthResult> {
    const { email, password, name, phone } = data;

    if (!email || !password || !name) {
      throw new BadRequestError("Email, password, and name are required");
    }

    if (typeof password !== "string" || password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "_id",
    );
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(String(password), 12);

    // Create user
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : undefined,
      role: "user" as UserRole,
    });

    // Generate tokens
    const tokens = await this.createTokenPair(user, deviceInfo);

    // Send welcome email (non-blocking)
    emailService.sendWelcome(user.email, user.name).catch((err) => {
      logger.error("Failed to send welcome email", { error: err, userId: user._id });
    });

    logger.info("User registered", { userId: user._id, email: user.email });

    return {
      user: user.toPublicJSON(),
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    token: string,
    deviceInfo?: DeviceInfo,
  ): Promise<TokenPair> {
    if (!token) {
      throw new BadRequestError("Refresh token is required");
    }

    // Verify the refresh token
    const payload = verifyRefreshToken(token);

    const tokenHash = hashToken(token);
    const storedToken = await RefreshToken.findOne({
      userId: payload.userId,
      tokenHash,
      revoked: false,
    });

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Rotate refresh token (revoke old, store new)
    storedToken.revoked = true;
    storedToken.revokedAt = new Date();
    storedToken.replacedByToken = hashToken(tokens.refreshToken);
    await storedToken.save();

    // Store new refresh token
    const newRefreshPayload = verifyRefreshToken(tokens.refreshToken);
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(tokens.refreshToken),
      deviceInfo: deviceInfo?.userAgent,
      ipAddress: deviceInfo?.ipAddress,
      expiresAt: new Date((newRefreshPayload.exp ?? 0) * 1000),
      revoked: false,
    });

    logger.info("Token refreshed", { userId: user._id });

    return tokens;
  }

  /**
   * Logout user (revoke all refresh tokens)
   */
  async logout(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );

    logger.info("User logged out", { userId });
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User");
    }

    return user.toPublicJSON();
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; phone?: string },
  ): Promise<Partial<IUser>> {
    const updateData: Record<string, unknown> = {};
    if (typeof updates.name === "string" && updates.name.trim()) {
      updateData.name = updates.name.trim();
    }
    if (typeof updates.phone === "string" && updates.phone.trim()) {
      updateData.phone = updates.phone.trim();
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    logger.info("Profile updated", { userId });

    return user.toPublicJSON();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = hashToken(resetToken);
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await User.findByIdAndUpdate(user._id, {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: resetExpires,
      });

      // Send password reset email
      await emailService.sendPasswordReset(user.email, resetToken, user.name);

      logger.info("Password reset requested", { userId: user._id });
    }

    // Always return success to prevent email enumeration
    // (even if user doesn't exist)
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new BadRequestError("Token and new password are required");
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    const tokenHash = hashToken(String(token));
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("_id");

    if (!user) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    await User.findByIdAndUpdate(user._id, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    // Revoke outstanding refresh tokens after a password reset
    await RefreshToken.updateMany(
      { userId: user._id, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );

    logger.info("Password reset completed", { userId: user._id });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    if (!token) {
      throw new BadRequestError("Verification token is required");
    }

    const tokenHash = hashToken(String(token));
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
    }).select("_id");

    if (!user) {
      throw new BadRequestError("Invalid verification token");
    }

    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
    });

    logger.info("Email verified", { userId: user._id });
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.isEmailVerified) {
      throw new BadRequestError("Email is already verified");
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);

    await User.findByIdAndUpdate(user._id, {
      emailVerificationToken: verificationTokenHash,
    });

    // Send verification email
    await emailService.sendEmailVerification(
      user.email,
      verificationToken,
      user.name,
    );

    logger.info("Email verification requested", { userId: user._id });
  }

  /**
   * Create token pair and store refresh token
   */
  private async createTokenPair(
    user: IUser,
    deviceInfo?: DeviceInfo,
  ): Promise<TokenPair> {
    const tokens = generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Store refresh token hash
    const refreshPayload = verifyRefreshToken(tokens.refreshToken);
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(tokens.refreshToken),
      deviceInfo: deviceInfo?.userAgent,
      ipAddress: deviceInfo?.ipAddress,
      expiresAt: new Date((refreshPayload.exp ?? 0) * 1000),
      revoked: false,
    });

    return tokens;
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new BadRequestError("Current and new password are required");
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      throw new BadRequestError("New password must be at least 8 characters");
    }

    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
      throw new NotFoundError("User");
    }

    const isPasswordValid = await user.comparePassword(String(currentPassword));
    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    await User.findByIdAndUpdate(userId, { passwordHash });

    // Revoke all refresh tokens to invalidate existing sessions
    await RefreshToken.updateMany(
      { userId, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );

    logger.info("Password changed", { userId });
  }
}

// Export singleton instance
export const authService = new AuthService();
