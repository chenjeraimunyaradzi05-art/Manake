/**
 * Unit tests for EmailService
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock nodemailer before importing the service
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({
        messageId: "test-message-id-123",
      }),
      verify: vi.fn().mockResolvedValue(true),
    })),
    createTestAccount: vi.fn().mockResolvedValue({
      user: "test@ethereal.email",
      pass: "testpass",
    }),
    getTestMessageUrl: vi.fn().mockReturnValue("https://ethereal.email/message/123"),
  },
}));

// Mock env
vi.mock("../../config/env", () => ({
  env: {
    SMTP_HOST: "smtp.test.com",
    SMTP_PORT: 587,
    SMTP_USER: "testuser",
    SMTP_PASS: "testpass",
    FROM_EMAIL: "noreply@manake.org",
    FRONTEND_URL: "http://localhost:5173",
  },
  isDevelopment: true,
  isProduction: false,
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EmailService", () => {
  let emailService: typeof import("../emailService").emailService;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to get fresh instance
    const module = await import("../emailService");
    emailService = module.emailService;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("send", () => {
    it("should send email successfully", async () => {
      const result = await emailService.send({
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it("should include preview URL in development", async () => {
      const result = await emailService.send({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.previewUrl).toBeDefined();
    });
  });

  describe("sendPasswordReset", () => {
    it("should send password reset email with correct link", async () => {
      const result = await emailService.sendPasswordReset(
        "user@example.com",
        "reset-token-123",
        "John",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("sendWelcome", () => {
    it("should send welcome email", async () => {
      const result = await emailService.sendWelcome(
        "newuser@example.com",
        "Jane Doe",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("sendContactNotification", () => {
    it("should send contact notification to admin", async () => {
      const result = await emailService.sendContactNotification(
        "visitor@example.com",
        "John Visitor",
        "I would like to learn more about your program.",
        "General Inquiry",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("sendMentorshipRequest", () => {
    it("should send mentorship request notification", async () => {
      const result = await emailService.sendMentorshipRequest(
        "mentor@example.com",
        "Dr. Mentor",
        "Young Mentee",
        "I would love your guidance.",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("sendEmailVerification", () => {
    it("should send email verification", async () => {
      const result = await emailService.sendEmailVerification(
        "user@example.com",
        "verification-token-456",
        "New User",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("verifyConnection", () => {
    it("should verify transporter connection", async () => {
      const isConnected = await emailService.verifyConnection();
      expect(isConnected).toBe(true);
    });
  });
});
