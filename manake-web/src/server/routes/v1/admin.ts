/**
 * Admin Routes
 * Requires admin or moderator role for all endpoints
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as adminController from "../../controllers/adminController";

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// ============ Dashboard ============
router.get(
  "/stats",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.getDashboardStats),
);

router.get(
  "/activity",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.getRecentActivity),
);

// ============ Story Moderation ============
router.get(
  "/stories/pending",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.getPendingStories),
);

router.patch(
  "/stories/:id/approve",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.approveStory),
);

router.patch(
  "/stories/:id/reject",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.rejectStory),
);

router.patch(
  "/stories/:id/feature",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.featureStory),
);

router.delete(
  "/stories/:id",
  requireRole(["admin"]),
  asyncHandler(adminController.deleteStory),
);

// ============ User Management ============
router.get(
  "/users",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.getUsers),
);

router.get(
  "/users/:id",
  requireRole(["admin", "moderator"]),
  asyncHandler(adminController.getUserById),
);

router.patch(
  "/users/:id/role",
  requireRole(["admin"]),
  asyncHandler(adminController.updateUserRole),
);

router.patch(
  "/users/:id/toggle-active",
  requireRole(["admin"]),
  asyncHandler(adminController.toggleUserActive),
);

router.delete(
  "/users/:id",
  requireRole(["admin"]),
  asyncHandler(adminController.deleteUser),
);

export default router;
