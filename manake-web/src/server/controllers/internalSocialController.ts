import { Request, Response } from "express";
import { InternalPost } from "../models/InternalPost";
import { NotFoundError } from "../errors";

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { content, mediaUrls, mediaType } = req.body;

  const post = await InternalPost.create({
    author: userId,
    content,
    mediaUrls,
    mediaType,
  });

  await post.populate("author", "name avatar");
  res.status(201).json(post);
};

// Get feed
export const getFeed = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const cursor = req.query.cursor as string;

  const query: any = {};
  if (cursor) {
    query._id = { $lt: cursor };
  }

  const posts = await InternalPost.find(query)
    .sort({ createdAt: -1 }) // Newest first
    .limit(limit)
    .populate("author", "name avatar")
    .lean();

  const nextCursor =
    posts.length === limit ? posts[posts.length - 1]._id : null;

  res.json({
    data: posts,
    nextCursor,
  });
};

// Get a single post by id
export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await InternalPost.findById(id)
    .populate("author", "name avatar")
    .lean();

  if (!post) throw new NotFoundError("Post");
  res.json(post);
};

// Like/Unlike
export const toggleLike = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const post = await InternalPost.findById(id);
  if (!post) throw new NotFoundError("Post");

  const likes = post.likes as any[]; // Mongoose types can be finicky
  const userIdStr = String(userId);
  const index = likes.findIndex((like) => String(like) === userIdStr);

  if (index === -1) {
    likes.push(userId as any);
  } else {
    likes.splice(index, 1);
  }

  post.likes = likes;
  await post.save();

  res.json({ likesCount: likes.length, isLiked: index === -1 });
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  // Only allow author or admin (middleware should handle role, here check author)
  const result = await InternalPost.deleteOne({ _id: id, author: userId });
  if (result.deletedCount === 0) throw new NotFoundError("Post");

  res.json({ message: "Deleted" });
};
