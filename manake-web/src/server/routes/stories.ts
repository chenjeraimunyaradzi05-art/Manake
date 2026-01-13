import { Router } from "express";
import {
  getStories,
  getStoryById,
  getStoryBySlug,
  createStory,
  likeStory,
  unlikeStory,
  getComments,
  addComment,
} from "../controllers/storyController";
import {
  likeRateLimit,
  strictRateLimit,
  contactRateLimit,
} from "../middleware/rateLimit";
import { authenticate, optionalAuth } from "../utils";
import { requireEmailVerified } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", getStories);
router.get("/slug/:slug", getStoryBySlug);
router.get("/:id", getStoryById);
router.get("/:id/comments", getComments);
router.post("/", strictRateLimit, authenticate, createStory); // Rate limited + authenticated
router.post(
  "/:id/like",
  likeRateLimit,
  authenticate,
  asyncHandler(requireEmailVerified),
  likeStory,
); // Rate limited to prevent spam
router.post(
  "/:id/unlike",
  likeRateLimit,
  authenticate,
  asyncHandler(requireEmailVerified),
  unlikeStory,
); // Symmetric endpoint for mobile clients
router.post(
  "/:id/comments",
  contactRateLimit,
  optionalAuth,
  asyncHandler(async (req, res, next) => {
    if (req.user?.userId) {
      return requireEmailVerified(req, res, next);
    }
    return next();
  }),
  addComment,
); // Rate limited like contact form

export default router;
