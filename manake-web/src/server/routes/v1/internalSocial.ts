import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { authenticate, optionalAuthenticate } from "../../utils/jwt";
import {
  createPost,
  getFeed,
  getPostById,
  toggleLike,
  deletePost,
} from "../../controllers/internalSocialController";

const router = Router();

// Public routes - feed is viewable without login
router.get("/feed", optionalAuthenticate, asyncHandler(getFeed));
router.get("/feed/:id", optionalAuthenticate, asyncHandler(getPostById));

// Protected routes - require authentication
router.post("/feed", authenticate, asyncHandler(createPost));
router.post("/feed/:id/like", authenticate, asyncHandler(toggleLike));
router.delete("/feed/:id", authenticate, asyncHandler(deletePost));

export default router;
