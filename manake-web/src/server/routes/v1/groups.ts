import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { authenticate, optionalAuthenticate } from "../../utils/jwt";
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getGroupFeed,
  createGroupPost,
  deleteGroup,
} from "../../controllers/groupController";

const router = Router();

// Public/optional auth routes
router.get("/", optionalAuthenticate, asyncHandler(getGroups));
router.get("/:groupId", optionalAuthenticate, asyncHandler(getGroup));
router.get("/:groupId/members", asyncHandler(getGroupMembers));
router.get("/:groupId/feed", asyncHandler(getGroupFeed));

// Authenticated routes
router.post("/", authenticate, asyncHandler(createGroup));
router.patch("/:groupId", authenticate, asyncHandler(updateGroup));
router.post("/:groupId/join", authenticate, asyncHandler(joinGroup));
router.post("/:groupId/leave", authenticate, asyncHandler(leaveGroup));
router.post("/:groupId/posts", authenticate, asyncHandler(createGroupPost));
router.delete("/:groupId", authenticate, asyncHandler(deleteGroup));

export default router;
