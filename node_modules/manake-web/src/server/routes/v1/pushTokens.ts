/**
 * Push Token Routes (v1)
 * Register/remove push notification tokens
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { authenticate, optionalAuth } from '../../utils/jwt';
import { validate } from '../../middleware/validation';
import { z } from 'zod';
import {
  registerPushToken,
  removePushToken,
  getUserTokens,
} from '../../controllers/pushTokenController';

const registerTokenSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().optional(),
});

const removeTokenSchema = z.object({
  token: z.string().min(10),
});

const router = Router();

// Register a push token (optionally authenticated)
router.post(
  '/register',
  optionalAuth,
  validate(registerTokenSchema, 'body'),
  asyncHandler(registerPushToken)
);

// Remove a push token
router.post('/remove', validate(removeTokenSchema, 'body'), asyncHandler(removePushToken));

// Get current user's tokens (authenticated)
router.get('/', authenticate, asyncHandler(getUserTokens));

export default router;
