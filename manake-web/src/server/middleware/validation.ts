/**
 * Request Validation Middleware
 * Uses Zod for type-safe validation (already in package.json)
 * Provides reusable validation schemas and middleware
 */
import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { ValidationError } from "../errors";

/**
 * Validation target - where to validate data from
 */
type ValidationTarget = "body" | "query" | "params";

const replaceObjectContents = (
  target: unknown,
  replacement: unknown,
): void => {
  if (!target || typeof target !== "object" || Array.isArray(target)) {
    return;
  }
  if (!replacement || typeof replacement !== "object" || Array.isArray(replacement)) {
    return;
  }

  for (const key of Object.keys(target as Record<string, unknown>)) {
    delete (target as Record<string, unknown>)[key];
  }
  Object.assign(
    target as Record<string, unknown>,
    replacement as Record<string, unknown>,
  );
};

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Zod schema
 */
export const validate = <T extends ZodSchema>(
  schema: T,
  target: ValidationTarget = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const validated = schema.parse(data);

      // Replace request data with validated/transformed data
      if (target === "query") {
        // Express/router may expose req.query as a getter-only property.
        // Mutate in place instead of reassigning.
        replaceObjectContents(req.query, validated);
      } else {
        req[target] = validated;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(new ValidationError(errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate multiple targets at once
 */
export const validateAll = <
  TBody extends ZodSchema = ZodSchema,
  TQuery extends ZodSchema = ZodSchema,
  TParams extends ZodSchema = ZodSchema,
>(schemas: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string }> = [];

    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(
          ...error.errors.map((err) => ({
            field: `body.${err.path.join(".")}`,
            message: err.message,
          })),
        );
      }
    }

    try {
      if (schemas.query) {
        const validatedQuery = schemas.query.parse(req.query);
        replaceObjectContents(req.query, validatedQuery);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(
          ...error.errors.map((err) => ({
            field: `query.${err.path.join(".")}`,
            message: err.message,
          })),
        );
      }
    }

    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(
          ...error.errors.map((err) => ({
            field: `params.${err.path.join(".")}`,
            message: err.message,
          })),
        );
      }
    }

    if (errors.length > 0) {
      next(new ValidationError(errors));
    } else {
      next();
    }
  };
};

// ============================================
// Common Validation Schemas
// ============================================

/**
 * MongoDB ObjectId validation
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

/**
 * Pagination query parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || "1", 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || "20", 10);
      return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
    }),
});

/**
 * Common ID params validation
 */
export const idParamsSchema = z.object({
  id: objectIdSchema,
});

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .trim();

/**
 * Password validation (min 8 chars, at least 1 number, 1 letter)
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Phone number validation (E.164 format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

/**
 * Zimbabwe phone number validation
 */
export const zwPhoneSchema = z
  .string()
  .regex(
    /^\+263[0-9]{9}$/,
    "Invalid Zimbabwe phone number (format: +263XXXXXXXXX)",
  );

/**
 * URL validation
 */
export const urlSchema = z.string().url("Invalid URL format");

/**
 * Safe string (no script tags or SQL injection patterns)
 */
export const safeStringSchema = z
  .string()
  .transform((val) => val.trim())
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    "Invalid characters detected",
  );

// ============================================
// Domain-Specific Schemas
// ============================================

/**
 * Story creation schema
 */
export const createStorySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(500),
  content: z.string().min(50, "Content must be at least 50 characters"),
  author: z
    .string()
    .min(2, "Author name must be at least 2 characters")
    .max(100),
  authorAge: z.number().int().min(12).max(120).optional(),
  image: urlSchema.optional(),
  category: z.enum([
    "recovery",
    "family",
    "community",
    "prevention",
    "support",
  ]),
  tags: z.array(z.string().max(50)).max(10).optional(),
  featured: z.boolean().optional().default(false),
});

/**
 * Story update schema (partial)
 */
export const updateStorySchema = createStorySchema.partial();

/**
 * Story query schema
 */
export const storyQuerySchema = paginationSchema.extend({
  category: z
    .enum(["all", "recovery", "family", "community", "prevention", "support"])
    .optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  search: z.string().max(100).optional(),
});

/**
 * Add comment schema
 * If the user is authenticated, author will be derived from their profile.
 * If unauthenticated, author is required (enforced in controller).
 */
export const addCommentSchema = z.object({
  author: z.string().min(2).max(100).optional(),
  content: z.string().min(5).max(2000),
});

/**
 * Contact form schema
 */
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema,
  phone: zwPhoneSchema.optional().or(z.literal("")),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
  isUrgent: z.boolean().optional().default(false),
});

/**
 * Donation schema
 */
export const donationSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(1, "Minimum donation is $1"),
  currency: z.enum(["USD", "ZWL"]).default("USD"),
  donorName: z.string().min(2).max(100).optional(),
  donorEmail: emailSchema.optional(),
  isAnonymous: z.boolean().optional().default(false),
  message: z.string().max(500).optional(),
  recurring: z.boolean().optional().default(false),
  frequency: z.enum(["monthly", "quarterly", "annually"]).optional(),
});

/**
 * User registration schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    phone: zwPhoneSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Social auth schemas
 */
export const socialProviderParamsSchema = z.object({
  provider: z.enum(["google", "facebook", "apple"]),
});

export const socialAuthBodySchema = z.object({
  token: z.string().min(10, "Token is required"),
  mode: z.enum(["login", "link"]).optional(),
  scopes: z.array(z.string()).optional(),
  pageId: z.string().optional(),
  pageName: z.string().optional(),
});

export const socialAuthorizeQuerySchema = z.object({
  redirectUri: urlSchema.optional(),
});

export const socialCallbackQuerySchema = z.object({
  code: z.string().min(5, "Authorization code is required"),
  state: z.string().optional(),
  redirectUri: urlSchema.optional(),
  mode: z.enum(["login", "link"]).optional(),
});

export const appleCodeExchangeSchema = z.object({
  code: z.string().min(5, "Authorization code is required"),
  codeVerifier: z.string().min(43).max(128).optional(), // PKCE code verifier (43-128 chars)
  redirectUri: urlSchema.optional(),
  mode: z.enum(["login", "link"]).optional(),
});

/**
 * Message schemas
 */
export const createMessageSchema = z.object({
  channel: z
    .enum(["whatsapp", "instagram", "facebook", "inapp", "sms", "email"])
    .default("inapp"),
  direction: z.enum(["inbound", "outbound"]).default("inbound"),
  status: z.enum(["pending", "sent", "delivered", "read", "failed"]).optional(),
  senderPhone: z.string().optional(),
  senderEmail: emailSchema.optional(),
  senderName: z.string().optional(),
  recipientPhone: z.string().optional(),
  recipientEmail: emailSchema.optional(),
  content: z.string().min(1).max(10000),
  contentType: z
    .enum(["text", "image", "video", "audio", "document", "location"])
    .default("text"),
  mediaUrl: urlSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  conversationId: z.string().optional(),
});

export const messageQuerySchema = paginationSchema.extend({
  status: z.enum(["pending", "sent", "delivered", "read", "failed"]).optional(),
  channel: z
    .enum(["whatsapp", "instagram", "facebook", "inapp", "sms", "email"])
    .optional(),
});

export const messageStatusSchema = z.object({
  status: z.enum(["pending", "sent", "delivered", "read", "failed"]),
  failureReason: z.string().optional(),
});

export const sendMessageSchema = z.object({
  channels: z
    .array(
      z.enum(["whatsapp", "instagram", "facebook", "inapp", "sms", "email"]),
    )
    .min(1, "At least one channel is required"),
  message: z.string().min(1).max(10000),
  recipientPhone: z.string().optional(),
  recipientId: z.string().optional(),
  mediaUrl: urlSchema.optional(),
});

export const messageSearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || "50", 10);
      return isNaN(num) || num < 1 ? 50 : Math.min(num, 100);
    }),
  channel: z
    .enum(["whatsapp", "instagram", "facebook", "inapp", "sms", "email"])
    .optional(),
});
