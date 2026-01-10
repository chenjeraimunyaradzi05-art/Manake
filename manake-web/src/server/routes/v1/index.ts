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

export default router;
