/**
 * Environment Configuration with Zod Validation
 * Provides type-safe access to environment variables
 */

import { z } from "zod";

// Environment schema with validation
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("5000"),

  // Database
  MONGODB_URI: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        value.startsWith("mongodb://") ||
        value.startsWith("mongodb+srv://"),
      { message: "Invalid MongoDB connection string" },
    ),

  // JWT
  JWT_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // OAuth - Facebook
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),

  // OAuth - Apple
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),

  // Email (optional for Phase 1)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // Push Notifications (optional)
  EXPO_ACCESS_TOKEN: z.string().optional(),

  // Frontend URL
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  // File uploads
  MAX_FILE_SIZE: z.string().transform(Number).default("10485760"), // 10MB
  ALLOWED_FILE_TYPES: z.string().default("image/jpeg,image/png,image/webp"),

  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).default("900000"), // 15 min
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
});

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
function validateEnv(): Env {
  try {
    // In production, validate strictly
    // In development/test, allow defaults
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      console.error("❌ Environment validation failed:");
      missing.forEach((m) => console.error(`   - ${m}`));

      // In development, continue with defaults
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Running with default values in development mode");
        return envSchema.parse({});
      }

      throw new Error(`Environment validation failed: ${missing.join(", ")}`);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

// Ensure required vars are set in production
export function ensureProductionEnv(): void {
  if (!isProduction) return;

  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "STRIPE_SECRET_KEY",
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for production: ${missing.join(", ")}`,
    );
  }
}
