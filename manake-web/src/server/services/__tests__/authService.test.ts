/**
 * Unit tests for AuthService
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$12$hashedpassword"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Mock User model
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: "test@example.com",
  name: "Test User",
  role: "user",
  passwordHash: "$2a$12$hashedpassword",
  lastLogin: null,
  isEmailVerified: false,
  save: vi.fn().mockResolvedValue(true),
  comparePassword: vi.fn().mockResolvedValue(true),
  toPublicJSON: vi.fn().mockReturnValue({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
  }),
};

vi.mock("../../models/User", () => ({
  User: {
    findOne: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUser),
    }),
    findById: vi.fn().mockResolvedValue(mockUser),
    findByIdAndUpdate: vi.fn().mockResolvedValue(mockUser),
    create: vi.fn().mockResolvedValue(mockUser),
  },
}));

// Mock RefreshToken model
vi.mock("../../models/RefreshToken", () => ({
  RefreshToken: {
    create: vi.fn().mockResolvedValue({ _id: "token-123" }),
    findOne: vi.fn().mockResolvedValue({
      userId: "user-123",
      tokenHash: "hashed-token",
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      save: vi.fn().mockResolvedValue(true),
    }),
    updateMany: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

// Mock JWT utilities
vi.mock("../../utils/jwt", () => ({
  generateTokenPair: vi.fn().mockReturnValue({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 900,
  }),
  hashToken: vi.fn().mockReturnValue("hashed-token"),
  verifyRefreshToken: vi.fn().mockReturnValue({
    userId: "user-123",
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  }),
}));

// Mock email service
vi.mock("./emailService", () => ({
  emailService: {
    sendWelcome: vi.fn().mockResolvedValue({ success: true }),
    sendPasswordReset: vi.fn().mockResolvedValue({ success: true }),
    sendEmailVerification: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AuthService", () => {
  let authService: typeof import("../authService").authService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import("../authService");
    authService = module.authService;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe("mock-access-token");
      expect(result.tokens.refreshToken).toBe("mock-refresh-token");
    });

    it("should throw error for missing credentials", async () => {
      await expect(
        authService.login({ email: "", password: "" }),
      ).rejects.toThrow("Email and password are required");
    });
  });

  describe("register", () => {
    it("should register a new user", async () => {
      // Mock findOne to return null (no existing user)
      const { User } = await import("../../models/User");
      vi.mocked(User.findOne).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(null),
      } as unknown as ReturnType<typeof User.findOne>);

      const result = await authService.register({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      });

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
    });

    it("should throw error for short password", async () => {
      await expect(
        authService.register({
          email: "test@example.com",
          password: "short",
          name: "Test",
        }),
      ).rejects.toThrow("Password must be at least 8 characters");
    });

    it("should throw error for missing fields", async () => {
      await expect(
        authService.register({
          email: "",
          password: "password123",
          name: "Test",
        }),
      ).rejects.toThrow("Email, password, and name are required");
    });
  });

  describe("logout", () => {
    it("should revoke all refresh tokens for user", async () => {
      const { RefreshToken } = await import("../../models/RefreshToken");

      await authService.logout("user-123");

      expect(RefreshToken.updateMany).toHaveBeenCalledWith(
        { userId: "user-123", revoked: false },
        { revoked: true, revokedAt: expect.any(Date) },
      );
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const profile = await authService.getProfile("user-123");

      expect(profile).toBeDefined();
      expect(profile.email).toBe("test@example.com");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const profile = await authService.updateProfile("user-123", {
        name: "Updated Name",
      });

      expect(profile).toBeDefined();
    });
  });

  describe("requestPasswordReset", () => {
    it("should request password reset without throwing", async () => {
      // Should not throw even if user doesn't exist
      await expect(
        authService.requestPasswordReset("nonexistent@example.com"),
      ).resolves.not.toThrow();
    });
  });

  describe("resetPassword", () => {
    it("should throw error for missing token or password", async () => {
      await expect(authService.resetPassword("", "newpass")).rejects.toThrow(
        "Token and new password are required",
      );
    });

    it("should throw error for short password", async () => {
      await expect(
        authService.resetPassword("valid-token", "short"),
      ).rejects.toThrow("Password must be at least 8 characters");
    });
  });

  describe("verifyEmail", () => {
    it("should throw error for missing token", async () => {
      await expect(authService.verifyEmail("")).rejects.toThrow(
        "Verification token is required",
      );
    });
  });

  describe("changePassword", () => {
    it("should throw error for missing passwords", async () => {
      await expect(
        authService.changePassword("user-123", "", "newpass"),
      ).rejects.toThrow("Current and new password are required");
    });

    it("should throw error for short new password", async () => {
      await expect(
        authService.changePassword("user-123", "oldpass", "short"),
      ).rejects.toThrow("New password must be at least 8 characters");
    });
  });
});
