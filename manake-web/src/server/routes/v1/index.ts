/**
 * API v1 Routes
 * Current API version - maintains backward compatibility
 */
import { Router } from "express";
import storyRoutes from "./stories";
import donationRoutes from "./donations";
import contactRoutes from "./contact";
import authRoutes from "./auth";
import socialRoutes from "./social";
import webhookRoutes from "./webhooks";
import messageRoutes from "./messages";
import pushTokenRoutes from "./pushTokens";
import adminRoutes from "./admin";
import conversationRoutes from "./conversations";
import internalSocialRoutes from "./internalSocial";
import connectionRoutes from "./connections";
import profileRoutes from "./profile";
import groupRoutes from "./groups";
import mentorshipRoutes from "./mentorship";

const router = Router();


// Mount routes
router.use("/stories", storyRoutes);
router.use("/donations", donationRoutes);
router.use("/contact", contactRoutes);
router.use("/auth", authRoutes);
router.use("/social", socialRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/messages", messageRoutes);
router.use("/push-tokens", pushTokenRoutes);
router.use("/admin", adminRoutes);
router.use("/conversations", conversationRoutes);
router.use("/community", internalSocialRoutes);
router.use("/connections", connectionRoutes);
router.use("/profiles", profileRoutes);
router.use("/groups", groupRoutes);
router.use("/mentorship", mentorshipRoutes);

export default router;
