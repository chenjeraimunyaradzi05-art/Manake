import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { authenticate } from "../../utils/jwt";
import {
  getOrCreateDirectConversation,
  createGroupConversation,
  listConversations,
  getConversationHistory,
} from "../../controllers/conversationController";

const router = Router();

// Apply auth to all conversation routes
router.use(authenticate);

// List my conversations
router.get("/", asyncHandler(listConversations));

// Start/Get direct chat
router.post("/direct", asyncHandler(getOrCreateDirectConversation));

// Start group chat
router.post("/group", asyncHandler(createGroupConversation));

// Get details/messages
router.get("/:id", asyncHandler(getConversationHistory));

export default router;
