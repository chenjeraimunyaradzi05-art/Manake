/**
 * Social Feed Controller
 * Serves aggregated social media posts from Instagram, Facebook, Twitter
 */

import { Request, Response } from "express";
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

  const platforms: SocialPlatform[] | undefined = platformsParam
    ? (platformsParam.split(",").filter(Boolean) as SocialPlatform[])
    : undefined;

  const result = await socialFeedService.getSocialFeed({
    platforms,
    limit,
    cursor,
  });
  res.json(result);
};

export const getInstagramFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor as string | undefined;
  const result = await socialFeedService.getInstagramFeed(limit, cursor);
  res.json(result);
};

export const getFacebookFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor as string | undefined;
  const result = await socialFeedService.getFacebookFeed(limit, cursor);
  res.json(result);
};

export const getTwitterFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor as string | undefined;
  const result = await socialFeedService.getTwitterFeed(limit, cursor);
  res.json(result);
};

export const likeSocialPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { platform, postId } = req.params as {
    platform: SocialPlatform;
    postId: string;
  };
  await socialFeedService.likeSocialPost(postId, platform);
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
  await socialFeedService.unlikeSocialPost(postId, platform);
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
  await socialFeedService.shareSocialPost(postId, platform);
  res.json({ message: "Shared" });
};
