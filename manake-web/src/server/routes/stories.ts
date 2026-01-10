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

const router = Router();

router.get("/", getStories);
router.get("/slug/:slug", getStoryBySlug);
router.get("/:id", getStoryById);
router.get("/:id/comments", getComments);
router.post("/", strictRateLimit, createStory); // Rate limited + TODO: Add auth middleware
router.post("/:id/like", likeRateLimit, likeStory); // Rate limited to prevent spam
router.post("/:id/unlike", likeRateLimit, unlikeStory); // Symmetric endpoint for mobile clients
router.post("/:id/comments", contactRateLimit, addComment); // Rate limited like contact form

export default router;
