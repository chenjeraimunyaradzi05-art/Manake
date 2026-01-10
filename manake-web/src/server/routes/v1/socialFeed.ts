/**
 * Social Feed Routes (v1)
 * Provides aggregated social media feed endpoints
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { optionalAuth } from "../../utils/jwt";
import {
  getSocialFeed,
  getInstagramFeed,
  getFacebookFeed,
  getTwitterFeed,
  likeSocialPost,
  unlikeSocialPost,
  shareSocialPost,
} from "../../controllers/socialFeedController";

const router = Router();

// Aggregated feed
router.get("/feed", optionalAuth, asyncHandler(getSocialFeed));

// Platform-specific feeds
router.get("/instagram/feed", optionalAuth, asyncHandler(getInstagramFeed));
router.get("/facebook/feed", optionalAuth, asyncHandler(getFacebookFeed));
router.get("/twitter/feed", optionalAuth, asyncHandler(getTwitterFeed));

// Post interactions (require auth in production, optional for demo)
router.post(
  "/:platform/posts/:postId/like",
  optionalAuth,
  asyncHandler(likeSocialPost),
);
router.delete(
  "/:platform/posts/:postId/like",
  optionalAuth,
  asyncHandler(unlikeSocialPost),
);
router.post(
  "/:platform/posts/:postId/share",
  optionalAuth,
  asyncHandler(shareSocialPost),
);

export default router;
