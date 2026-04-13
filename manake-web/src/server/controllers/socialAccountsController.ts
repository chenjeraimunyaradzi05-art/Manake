import { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../errors";
import { prisma } from "../config/prisma";

function requireUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) throw new UnauthorizedError("Authentication required");
  return userId;
}

export const listConnectedAccounts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = requireUserId(req);

  const accounts = await prisma.socialAccount.findMany({
    where: { userId, isActive: true },
    select: {
      id: true,
      platform: true,
      platformUserId: true,
      platformUsername: true,
      displayName: true,
      profilePictureUrl: true,
      scopes: true,
      pageId: true,
      pageName: true,
      isActive: true,
      lastSyncAt: true,
      syncError: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json({ accounts });
};

export const disconnectAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = requireUserId(req);
  const { platform, platformUserId } = req.params as {
    platform: string;
    platformUserId: string;
  };

  const result = await prisma.socialAccount.updateMany({
    where: { userId, platform, platformUserId },
    data: { isActive: false },
  });

  if (result.count === 0) throw new NotFoundError("Social account");

  res.json({ message: "Disconnected" });
};
