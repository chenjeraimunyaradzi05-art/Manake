/**
 * Stories Routes - API v1
 */
import { Router } from "express";
import {
  getStories,
  getStoryById,
  getStoryBySlug,
  likeStory,
  unlikeStory,
  createStory,
  getComments,
  addComment,
} from "../../controllers/storyController";
import { asyncHandler } from "../../middleware/errorHandler";
import {
  validate,
  idParamsSchema,
  storyQuerySchema,
  createStorySchema,
  addCommentSchema,
} from "../../middleware/validation";
import { likeRateLimit } from "../../middleware/rateLimit";
import { authenticate, authorize, optionalAuth } from "../../utils/jwt";
import { requireEmailVerified } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/", validate(storyQuerySchema, "query"), asyncHandler(getStories));
router.get("/slug/:slug", asyncHandler(getStoryBySlug));
router.get(
  "/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(getStoryById),
);
router.get(
  "/:id/comments",
  validate(idParamsSchema, "params"),
  asyncHandler(getComments),
);

// Rate-limited public actions
router.post(
  "/:id/like",
  validate(idParamsSchema, "params"),
  likeRateLimit,
  authenticate,
  asyncHandler(requireEmailVerified),
  asyncHandler(likeStory),
);
router.post(
  "/:id/unlike",
  validate(idParamsSchema, "params"),
  likeRateLimit,
  authenticate,
  asyncHandler(requireEmailVerified),
  asyncHandler(unlikeStory),
);
router.post(
  "/:id/comments",
  validate(idParamsSchema, "params"),
  validate(addCommentSchema, "body"),
  optionalAuth,
  asyncHandler(async (req, res, next) => {
    // If authenticated, enforce verified email
    if (req.user?.userId) {
      return requireEmailVerified(req, res, next);
    }
    return next();
  }),
  asyncHandler(addComment),
);

// Protected routes (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin", "moderator"),
  validate(createStorySchema, "body"),
  asyncHandler(createStory),
);

export default router;
