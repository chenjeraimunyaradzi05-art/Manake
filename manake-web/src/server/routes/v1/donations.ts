/**
 * Donations Routes - API v1
 */
import { Router, Request, Response } from 'express';
import { createPaymentIntent } from '../../controllers/donationController';
import { asyncHandler } from '../../middleware/errorHandler';
import { validate, donationSchema, paginationSchema } from '../../middleware/validation';
import { strictRateLimit } from '../../middleware/rateLimit';
import { authenticate, authorize } from '../../utils/jwt';
import { Donation } from '../../models/Donation';
import express from 'express';
import { stripe } from '../../config/stripe';

const router = Router();

// Public routes
router.post(
  '/',
  strictRateLimit,
  validate(donationSchema, 'body'),
  asyncHandler(createPaymentIntent)
);

// Stripe webhook - needs raw body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await Donation.findOneAndUpdate(
            { paymentIntentId: session.id },
            { status: 'completed', completedAt: new Date() }
          );
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          await Donation.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            { status: 'failed' }
          );
          break;
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).json({ message: 'Webhook error' });
    }
  })
);

// Protected routes (admin only)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(paginationSchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [donations, total] = await Promise.all([
      Donation.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Donation.countDocuments()
    ]);

    res.json({
      data: donations,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  })
);

router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.json(stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 });
  })
);

export default router;
