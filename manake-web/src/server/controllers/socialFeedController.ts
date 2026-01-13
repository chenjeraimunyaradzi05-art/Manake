/**
 * Social Feed Controller
 * Serves aggregated social media posts from Instagram, Facebook, Twitter
 */

import { Request, Response } from "express";
import { UnauthorizedError } from "../errors";
import socialFeedService, {
  SocialPlatform,
} from "../services/socialFeedService";

export const getSocialFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const platformsParam = req.query.platforms as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor as string | undefined;
  const userId = req.user?.userId;

  const platforms: SocialPlatform[] | undefined = platformsParam
    ? (platformsParam.split(",").filter(Boolean) as SocialPlatform[])
    : undefined;

  const result = await socialFeedService.getSocialFeed({
    platforms,
    limit,
    cursor,
  }, userId);
  res.json(result);
};

export const getInstagramFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor as string | undefined;
  const userId = req.user?.userId;
  const result = await socialFeedService.getSocialFeed(
    { platforms: ["instagram"], limit, cursor },
    userId,
  );
  res.json(result);
};

export const getFacebookFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor as string | undefined;
  const userId = req.user?.userId;
  const result = await socialFeedService.getSocialFeed(
    { platforms: ["facebook"], limit, cursor },
    userId,
  );
  res.json(result);
};

export const getTwitterFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor as string | undefined;
  const userId = req.user?.userId;
  const result = await socialFeedService.getSocialFeed(
    { platforms: ["twitter"], limit, cursor },
    userId,
  );
  res.json(result);
};

export const getSocialPost = async (req: Request, res: Response): Promise<void> => {
  const { platform, postId } = req.params as {
    platform: SocialPlatform;
    postId: string;
  };
  const userId = req.user?.userId;
  const post = await socialFeedService.getSocialPost(postId, platform, userId);
  res.json(post);
};

function requireUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) throw new UnauthorizedError("Authentication required");
  return userId;
}

export const likeSocialPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { platform, postId } = req.params as {
    platform: SocialPlatform;
    postId: string;
  };
  const userId = requireUserId(req);
  await socialFeedService.likeSocialPost(postId, platform, userId);
  res.json({ message: "Liked" });
};

export const unlikeSocialPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { platform, postId } = req.params as {
    platform: SocialPlatform;
    postId: string;
  };
  const userId = requireUserId(req);
  await socialFeedService.unlikeSocialPost(postId, platform, userId);
  res.json({ message: "Unliked" });
};

export const shareSocialPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { platform, postId } = req.params as {
    platform: SocialPlatform;
    postId: string;
  };
  const userId = requireUserId(req);
  await socialFeedService.shareSocialPost(postId, platform, userId);
  res.json({ message: "Shared" });
};
