import { Request, Response } from "express";
import { Story } from "../models/Story";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import { escapeRegex } from "../utils/regex";

export const getStories = async (req: Request, res: Response) => {
  try {
    const { category, search, limit, page = 1, featured, status } = req.query;

    // Build query filter - default to published stories only
    const filter: Record<string, unknown> = {
      status: status || "published",
    };
    if (category && category !== "all") {
      filter.category = category;
    }
    if (featured === "true") {
      filter.featured = true;
    }
    if (search) {
      const safeSearch = escapeRegex(String(search).trim().slice(0, 64));
      const safeRegex = new RegExp(safeSearch, "i");
      filter.$or = [
        { title: safeRegex },
        { excerpt: safeRegex },
        { tags: safeRegex },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [stories, total] = await Promise.all([
      Story.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Story.countDocuments(filter),
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
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    logger.error("Error fetching story", { error });
    res.status(500).json({ message: "Error fetching story" });
  }
};

export const getStoryBySlug = async (req: Request, res: Response) => {
  try {
    const story = await Story.findOne({ slug: req.params.slug });
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

    const updated = await Story.findOneAndUpdate(
      { _id: storyId, likedBy: { $ne: req.user.userId } },
      { $addToSet: { likedBy: req.user.userId }, $inc: { likes: 1 } },
      { new: true }
    ).select("likes");

    if (!updated) {
      const exists = await Story.findById(storyId).select("likes");
      if (!exists) return res.status(404).json({ message: "Story not found" });
      return res.json({ likes: exists.likes, liked: true });
    }

    res.json({ likes: updated.likes, liked: true });
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

    const updated = await Story.findOneAndUpdate(
      { _id: storyId, likedBy: req.user.userId },
      { $pull: { likedBy: req.user.userId }, $inc: { likes: -1 } },
      { new: true }
    ).select("likes");

    if (!updated) {
      const exists = await Story.findById(storyId).select("likes");
      if (!exists) return res.status(404).json({ message: "Story not found" });
      return res.json({ likes: exists.likes, liked: false });
    }

    res.json({ likes: Math.max(0, updated.likes), liked: false });
  } catch (error) {
    logger.error("Error unliking story", { error });
    res.status(500).json({ message: "Error unliking story" });
  }
};

export const createStory = async (req: Request, res: Response) => {
  try {
    const storyData = {
      ...req.body,
      status: "pending", // All user-submitted stories start as pending
      submittedBy: req.user?.userId, // Track who submitted if authenticated
    };
    const newStory = new Story(storyData);
    const savedStory = await newStory.save();
    res.status(201).json({
      message: "Story submitted for review",
      data: savedStory,
    });
  } catch (error) {
    logger.error("Error creating story", { error });
    res.status(400).json({ message: "Error creating story" });
  }
};

// Get comments for a story
export const getComments = async (req: Request, res: Response) => {
  try {
    const story = await Story.findById(req.params.id).select("comments");
    if (!story) return res.status(404).json({ message: "Story not found" });

    res.json({
      data: story.comments || [],
      count: story.comments?.length || 0,
    });
  } catch (error) {
    logger.error("Error fetching comments", { error });
    res.status(500).json({ message: "Error fetching comments" });
  }
};

// Add a comment to a story
export const addComment = async (req: Request, res: Response) => {
  try {
    const { author: authorFromBody, content } = req.body;

    // If authenticated, always derive author from user profile to prevent spoofing
    let author = authorFromBody;
    if (req.user?.userId) {
      const user = await User.findById(req.user.userId).select("name email");
      author = user?.name || user?.email || "User";
    }

    // Validate input
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

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const comment = {
      author: author.trim(),
      content: content.trim(),
      createdAt: new Date(),
    };

    story.comments = story.comments || [];
    story.comments.push(comment);
    await story.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: story.comments[story.comments.length - 1],
    });
  } catch (error) {
    logger.error("Error adding comment", { error });
    res.status(500).json({ message: "Error adding comment" });
  }
};
