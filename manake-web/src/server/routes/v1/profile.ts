import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { authenticate, optionalAuthenticate } from "../../utils/jwt";
import {
  getProfile,
  getUserActivity,
  getUserStats,
  updateProfile,
  getMutualConnections,
} from "../../controllers/profileController";

const router = Router();

// Public routes (optional auth for privacy checks)
router.get("/:userId", optionalAuthenticate, asyncHandler(getProfile));
router.get("/:userId/activity", asyncHandler(getUserActivity));
router.get("/:userId/stats", asyncHandler(getUserStats));

// Authenticated routes
router.patch("/me", authenticate, asyncHandler(updateProfile));
router.get("/:userId/mutual-connections", authenticate, asyncHandler(getMutualConnections));

export default router;
