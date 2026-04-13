import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";
import { escapeRegex } from "../utils/regex";

export const getStories = async (req: Request, res: Response) => {
  try {
    const { category, search, limit, page = 1, featured, status } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const searchStr = search
      ? escapeRegex(String(search).trim().slice(0, 64))
      : null;

    const storyWhere = {
      status: (status as string) || "published",
      ...(category && category !== "all"
        ? { category: category as string }
        : {}),
      ...(featured === "true" ? { featured: true } : {}),
      ...(searchStr
        ? {
            OR: [
              { title: { contains: searchStr, mode: "insensitive" as const } },
              {
                excerpt: { contains: searchStr, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where: storyWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: { comments: true },
      }),
      prisma.story.count({ where: storyWhere }),
    ]);

    // Return paginated shape that frontend expects
    res.json({
      data: stories,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error("Error fetching stories", { error });
    res.status(500).json({ message: "Error fetching stories" });
  }
};

export const getStoryById = async (req: Request, res: Response) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id: req.params.id },
      include: { comments: true },
    });
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    logger.error("Error fetching story", { error });
    res.status(500).json({ message: "Error fetching story" });
  }
};

export const getStoryBySlug = async (req: Request, res: Response) => {
  try {
    const story = await prisma.story.findUnique({
      where: { slug: req.params.slug },
      include: { comments: true },
    });
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    logger.error("Error fetching story by slug", { error });
    res.status(500).json({ message: "Error fetching story" });
  }
};

export const likeStory = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const storyId = req.params.id;
    const userId = req.user.userId;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, likes: true },
    });
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Upsert like row; if already exists, do nothing
    const existing = await prisma.storyLike.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    if (!existing) {
      await prisma.$transaction([
        prisma.storyLike.create({ data: { userId, storyId } }),
        prisma.story.update({
          where: { id: storyId },
          data: { likes: { increment: 1 } },
        }),
      ]);
    }
    const updated = await prisma.story.findUnique({
      where: { id: storyId },
      select: { likes: true },
    });
    res.json({ likes: updated?.likes ?? story.likes, liked: true });
  } catch (error) {
    logger.error("Error liking story", { error });
    res.status(500).json({ message: "Error liking story" });
  }
};

export const unlikeStory = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const storyId = req.params.id;
    const userId = req.user.userId;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, likes: true },
    });
    if (!story) return res.status(404).json({ message: "Story not found" });

    const existing = await prisma.storyLike.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    if (existing) {
      await prisma.$transaction([
        prisma.storyLike.delete({
          where: { userId_storyId: { userId, storyId } },
        }),
        prisma.story.update({
          where: { id: storyId },
          data: { likes: { decrement: 1 } },
        }),
      ]);
    }
    const updated = await prisma.story.findUnique({
      where: { id: storyId },
      select: { likes: true },
    });
    res.json({
      likes: Math.max(0, updated?.likes ?? story.likes),
      liked: false,
    });
  } catch (error) {
    logger.error("Error unliking story", { error });
    res.status(500).json({ message: "Error unliking story" });
  }
};

export const createStory = async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, category, image, tags, author } = req.body;
    const authorName =
      typeof author === "object" ? author?.name : author || "Anonymous";
    const authorRole =
      typeof author === "object" ? author?.role : "Community Member";
    const authorImage = typeof author === "object" ? author?.image : undefined;

    // Auto-generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const savedStory = await prisma.story.create({
      data: {
        title,
        excerpt,
        content,
        category,
        image,
        tags: Array.isArray(tags) ? tags : [],
        slug,
        authorName,
        authorRole,
        authorImage,
        status: "pending",
        submittedById: req.user?.userId ?? null,
      },
    });
    res.status(201).json({
      message: "Story submitted for review",
      data: savedStory,
    });
  } catch (error) {
    logger.error("Error creating story", { error });
    res.status(400).json({ message: "Error creating story" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const storyExists = await prisma.story.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!storyExists)
      return res.status(404).json({ message: "Story not found" });

    const comments = await prisma.storyComment.findMany({
      where: { storyId: req.params.id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ data: comments, count: comments.length });
  } catch (error) {
    logger.error("Error fetching comments", { error });
    res.status(500).json({ message: "Error fetching comments" });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { author: authorFromBody, content } = req.body;

    let author = authorFromBody;
    if (req.user?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { name: true, email: true },
      });
      author = user?.name || user?.email || "User";
    }

    if (!author || typeof author !== "string" || author.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Author name is required (min 2 characters)" });
    }
    if (!content || typeof content !== "string" || content.trim().length < 5) {
      return res
        .status(400)
        .json({ message: "Comment content is required (min 5 characters)" });
    }
    if (author.length > 100) {
      return res
        .status(400)
        .json({ message: "Author name too long (max 100 characters)" });
    }
    if (content.length > 2000) {
      return res
        .status(400)
        .json({ message: "Comment too long (max 2000 characters)" });
    }

    const storyExists = await prisma.story.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!storyExists)
      return res.status(404).json({ message: "Story not found" });

    const comment = await prisma.storyComment.create({
      data: {
        storyId: req.params.id,
        author: author.trim(),
        content: content.trim(),
      },
    });

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    logger.error("Error adding comment", { error });
    res.status(500).json({ message: "Error adding comment" });
  }
};
