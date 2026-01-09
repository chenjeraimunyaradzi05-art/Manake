/**
 * Push Token Controller
 * Manages device push notification tokens
 */

import { Request, Response } from 'express';
import { PushToken } from '../models/PushToken';
import { UnauthorizedError } from '../errors';

export const registerPushToken = async (req: Request, res: Response): Promise<void> => {
  const { token, platform, deviceId } = req.body as {
    token: string;
    platform: 'ios' | 'android' | 'web';
    deviceId?: string;
  };

  const userId = req.user?.userId;

  // Upsert token
  await PushToken.findOneAndUpdate(
    { token },
    {
      userId,
      token,
      platform,
      deviceId,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  res.json({ message: 'Push token registered' });
};

export const removePushToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token: string };

  await PushToken.findOneAndUpdate({ token }, { isActive: false });

  res.json({ message: 'Push token removed' });
};

export const getUserTokens = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  const tokens = await PushToken.find({ userId: req.user.userId, isActive: true }).select(
    'token platform deviceId createdAt'
  );

  res.json({ data: tokens });
};
