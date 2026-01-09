/**
 * API Routes Index
 * Supports versioned APIs with backward compatibility
 */
import { Router, Request, Response } from 'express';
import storyRoutes from './stories';
import donationRoutes from './donations';
import contactRoutes from './contact';
import v1Routes from './v1';
import { strictRateLimit } from '../middleware/rateLimit';
import { legacySocialLoginApple, legacySocialLoginGoogle } from '../controllers/mobileAuthSocialController';

const router = Router();

/**
 * API Version 1 - Full featured routes with auth
 * Mount at /api/v1/*
 */
router.use('/v1', v1Routes);

/**
 * Legacy mobile-compatible auth endpoints
 * The Expo mobile client currently calls /api/auth/* (without /v1)
 */
router.post('/auth/social/google', strictRateLimit, legacySocialLoginGoogle);
router.post('/auth/social/apple', strictRateLimit, legacySocialLoginApple);

/**
 * Legacy routes (backward compatibility)
 * Mount at /api/* - mirrors v1 for now
 * Will be deprecated in future versions
 */
router.use('/stories', storyRoutes);
router.use('/donations', donationRoutes);
router.use('/contact', contactRoutes);

/**
 * API info endpoint
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Manake API',
    version: '1.0.0',
    versions: {
      v1: '/api/v1',
    },
    documentation: '/api/docs',
    health: '/health',
  });
});

export default router;
