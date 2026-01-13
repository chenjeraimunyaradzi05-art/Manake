import { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../errors";
import { SocialAccount } from "../models/SocialAccount";

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

  const accounts = await SocialAccount.find({ userId, isActive: true })
    .select(
      "platform platformUserId platformUsername displayName profilePictureUrl scopes pageId pageName isActive lastSyncAt syncError createdAt updatedAt",
    )
    .sort({ updatedAt: -1 })
    .lean();

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

  const account = await SocialAccount.findOneAndUpdate(
    { userId, platform, platformUserId },
    { isActive: false },
    { new: true },
  );

  if (!account) throw new NotFoundError("Social account");

  res.json({ message: "Disconnected" });
};
