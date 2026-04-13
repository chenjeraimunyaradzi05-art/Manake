/**
 * Donations Routes - API v1
 */
import { Router, Request, Response } from "express";
import { createPaymentIntent } from "../../controllers/donationController";
import { asyncHandler } from "../../middleware/errorHandler";
import {
  validate,
  donationSchema,
  paginationSchema,
} from "../../middleware/validation";
import { strictRateLimit } from "../../middleware/rateLimit";
import { authenticate, authorize } from "../../utils/jwt";
import { prisma } from "../../config/prisma";
import express from "express";
import { requireStripe } from "../../config/stripe";
import { logger } from "../../utils/logger";

const router = Router();

// Public routes
router.post(
  "/",
  strictRateLimit,
  validate(donationSchema, "body"),
  asyncHandler(createPaymentIntent),
);

// Stripe webhook - needs raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req: Request, res: Response) => {
    let stripe;
    try {
      stripe = requireStripe();
    } catch (error) {
      return res.status(503).json({
        message:
          error instanceof Error ? error.message : "Stripe is not configured",
      });
    }

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    try {
      const requestWithRawBody = req as Request & { rawBody?: Buffer };
      const rawBody = requestWithRawBody.rawBody ?? req.body;

      if (typeof rawBody !== "string" && !Buffer.isBuffer(rawBody)) {
        logger.error("Webhook error", { error: "Missing raw request body" });
        return res.status(400).json({ message: "Webhook error" });
      }

      const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          await prisma.donation.updateMany({
            where: { paymentIntentId: session.id },
            data: { status: "completed", completedAt: new Date() },
          });
          break;
        }
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object;
          await prisma.donation.updateMany({
            where: { paymentIntentId: paymentIntent.id },
            data: { status: "failed" },
          });
          break;
        }
      }

      res.json({ received: true });
    } catch (err) {
      logger.error("Webhook error", { error: err });
      res.status(400).json({ message: "Webhook error" });
    }
  }),
);

// Protected routes (admin only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  validate(paginationSchema, "query"),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.donation.count(),
    ]);

    res.json({
      data: donations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }),
);

router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  asyncHandler(async (_req: Request, res: Response) => {
    const agg = await prisma.donation.aggregate({
      where: { status: { in: ["completed", "succeeded"] } },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });

    res.json({
      totalAmount: agg._sum.amount ?? 0,
      count: agg._count.id ?? 0,
      avgAmount: agg._avg.amount ?? 0,
    });
  }),
);

export default router;
