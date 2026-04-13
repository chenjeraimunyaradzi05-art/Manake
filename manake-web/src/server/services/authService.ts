/**
 * Authentication Service
 * Handles core authentication business logic
 * Extracted from authController for better testability and reusability
 */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  assertJwtConfig,
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
import { prisma } from "../config/prisma";
import { emailService } from "./emailService";
import { logger } from "../utils/logger";

type PrismaUser = NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;

// Map a Prisma User row to the public-safe shape returned by the API
function userToPublic(user: PrismaUser): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    role: user.role,
    avatar: user.avatar ?? undefined,
    isEmailVerified: user.isEmailVerified,
    bio: user.bio ?? undefined,
    preferences: {
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      notifications: user.pushNotifications,
      emailUpdates: user.emailNotifications,
      darkMode: false,
      language: "en",
    },
    stats: {
      storiesLiked: 0,
      commentsMade: 0,
      totalDonated: 0,
      storiesShared: 0,
    },
    createdAt: user.createdAt,
    joinedAt: user.createdAt,
  };
}

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
  user: Record<string, unknown>;
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

    assertJwtConfig();

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const now = new Date();
    if (user.lockoutUntil && user.lockoutUntil.getTime() > now.getTime()) {
      throw new UnauthorizedError(
        "Account temporarily locked. Please try again later.",
      );
    }

    const isPasswordValid = await bcrypt.compare(
      String(password),
      user.passwordHash,
    );
    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: Record<string, unknown> = {
        failedLoginAttempts: attempts,
      };
      if (attempts >= this.MAX_FAILED_LOGIN_ATTEMPTS) {
        updateData.failedLoginAttempts = 0;
        updateData.lockoutUntil = new Date(
          now.getTime() + this.LOCKOUT_DURATION_MS,
        );
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });
      throw new UnauthorizedError("Invalid email or password");
    }

    // Reset lockout state and update last login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockoutUntil: null, lastLogin: now },
    });

    // Generate tokens
    const tokens = await this.createTokenPair(updatedUser, deviceInfo);

    logger.info("User logged in", { userId: user.id, email: user.email });

    return {
      user: userToPublic(updatedUser),
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

    assertJwtConfig();

    if (!email || !password || !name) {
      throw new BadRequestError("Email, password, and name are required");
    }

    if (typeof password !== "string" || password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: String(name).trim(),
        phone: phone ? String(phone).trim() : undefined,
        role: "user",
      },
    });

    const tokens = await this.createTokenPair(user, deviceInfo);

    emailService.sendWelcome(user.email, user.name).catch((err) => {
      logger.error("Failed to send welcome email", {
        error: err,
        userId: user.id,
      });
    });

    logger.info("User registered", { userId: user.id, email: user.email });

    return {
      user: userToPublic(user),
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
    const storedToken = await prisma.refreshToken.findFirst({
      where: { userId: payload.userId, tokenHash, revoked: false },
    });

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revoked: true,
        revokedAt: new Date(),
        replacedByToken: hashToken(tokens.refreshToken),
      },
    });

    const newRefreshPayload = verifyRefreshToken(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken),
        deviceInfo: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
        expiresAt: new Date((newRefreshPayload.exp ?? 0) * 1000),
        revoked: false,
      },
    });

    logger.info("Token refreshed", { userId: user.id });

    return tokens;
  }

  /**
   * Logout user (revoke all refresh tokens)
   */
  async logout(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    logger.info("User logged out", { userId });
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User");
    }

    return userToPublic(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; phone?: string },
  ): Promise<Record<string, unknown>> {
    const updateData: Record<string, unknown> = {};
    if (typeof updates.name === "string" && updates.name.trim()) {
      updateData.name = updates.name.trim();
    }
    if (typeof updates.phone === "string" && updates.phone.trim()) {
      updateData.phone = updates.phone.trim();
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    logger.info("Profile updated", { userId });

    return userToPublic(user);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = hashToken(resetToken);
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetTokenHash,
          passwordResetExpires: resetExpires,
        },
      });

      await emailService.sendPasswordReset(user.email, resetToken, user.name);

      logger.info("Password reset requested", { userId: user.id });
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
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    logger.info("Password reset completed", { userId: user.id });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    if (!token) {
      throw new BadRequestError("Verification token is required");
    }

    const tokenHash = hashToken(String(token));
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: tokenHash },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestError("Invalid verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null },
    });

    logger.info("Email verified", { userId: user.id });
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.isEmailVerified) {
      throw new BadRequestError("Email is already verified");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationTokenHash },
    });

    await emailService.sendEmailVerification(
      user.email,
      verificationToken,
      user.name,
    );

    logger.info("Email verification requested", { userId: user.id });
  }

  /**
   * Create token pair and store refresh token
   */
  private async createTokenPair(
    user: PrismaUser,
    deviceInfo?: DeviceInfo,
  ): Promise<TokenPair> {
    assertJwtConfig();

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshPayload = verifyRefreshToken(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken),
        deviceInfo: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
        expiresAt: new Date((refreshPayload.exp ?? 0) * 1000),
        revoked: false,
      },
    });

    return tokens;
  }

  async findById(userId: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async findByEmail(email: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
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

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User");
    }

    const isPasswordValid = await bcrypt.compare(
      String(currentPassword),
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    logger.info("Password changed", { userId });
  }
}

// Export singleton instance
export const authService = new AuthService();
