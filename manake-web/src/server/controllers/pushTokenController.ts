/**
 * Push Token Controller
 * Manages device push notification tokens
 */

import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { UnauthorizedError } from "../errors";

export const registerPushToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token, platform, deviceId } = req.body as {
    token: string;
    platform: "ios" | "android" | "web";
    deviceId?: string;
  };

  const userId = req.user?.userId;

  await prisma.pushToken.upsert({
    where: { token },
    update: { userId, platform, deviceId, isActive: true },
    create: { token, userId, platform, deviceId, isActive: true },
  });

  res.json({ message: "Push token registered" });
};

export const removePushToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body as { token: string };

  await prisma.pushToken.updateMany({
    where: { token },
    data: { isActive: false },
  });

  res.json({ message: "Push token removed" });
};

export const getUserTokens = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new UnauthorizedError("Authentication required");
  }

  const tokens = await prisma.pushToken.findMany({
    where: { userId: req.user.userId, isActive: true },
    select: { token: true, platform: true, deviceId: true, createdAt: true },
  });

  res.json({ data: tokens });
};
