/**
 * Middleware Index
 * Central export for all middleware
 */

// Error handling
export { errorHandler, notFoundHandler, asyncHandler } from "./errorHandler";

// Validation
export {
  validate,
  validateAll,
  // Common schemas
  objectIdSchema,
  paginationSchema,
  idParamsSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  zwPhoneSchema,
  urlSchema,
  safeStringSchema,
  // Domain schemas
  createStorySchema,
  updateStorySchema,
  storyQuerySchema,
  contactSchema,
  donationSchema,
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "./validation";

// Rate limiting
export {
  rateLimit,
  strictRateLimit,
  likeRateLimit,
  contactRateLimit,
} from "./rateLimit";

// Request logging
export { requestLogger, maskSensitiveData } from "./requestLogger";

// Security
export {
  securityHeaders,
  corsPreflightHandler,
  sanitizeRequest,
  validateApiKey,
} from "./security";
