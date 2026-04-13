import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { NotFoundError } from "../errors";

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { content, mediaUrls, mediaType } = req.body;

  const post = await prisma.internalPost.create({
    data: { authorId: userId, content, mediaUrls: mediaUrls || [], mediaType },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });
  res.status(201).json(post);
};

// Get feed
export const getFeed = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const cursor = req.query.cursor as string;

  const posts = await prisma.internalPost.findMany({
    where: cursor ? { id: { lt: cursor } } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;
  res.json({ data: posts, nextCursor });
};

// Get a single post by id
export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await prisma.internalPost.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });
  if (!post) throw new NotFoundError("Post");
  res.json(post);
};

// Like/Unlike
export const toggleLike = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const post = await prisma.internalPost.findUnique({
    where: { id },
    select: { likes: true },
  });
  if (!post) throw new NotFoundError("Post");

  const isLiked = post.likes.includes(userId);
  const updatedLikes = isLiked
    ? post.likes.filter((l: string) => l !== userId)
    : [...post.likes, userId];

  await prisma.internalPost.update({
    where: { id },
    data: { likes: { set: updatedLikes } },
  });
  res.json({ likesCount: updatedLikes.length, isLiked: !isLiked });
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  // Only allow author or admin (middleware should handle role, here check author)
  const result = await prisma.internalPost.deleteMany({
    where: { id, authorId: userId },
  });
  if (result.count === 0) throw new NotFoundError("Post");

  res.json({ message: "Deleted" });
};
