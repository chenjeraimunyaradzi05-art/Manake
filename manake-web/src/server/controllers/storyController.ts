import { Request, Response } from "express";
import { Story } from "../models/Story";

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
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search as string, "i")] } },
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
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Error fetching stories" });
  }
};

export const getStoryById = async (req: Request, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({ message: "Error fetching story" });
  }
};

export const getStoryBySlug = async (req: Request, res: Response) => {
  try {
    const story = await Story.findOne({ slug: req.params.slug });
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    console.error("Error fetching story by slug:", error);
    res.status(500).json({ message: "Error fetching story" });
  }
};

export const likeStory = async (req: Request, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    story.likes += 1;
    await story.save();

    res.json({ likes: story.likes });
  } catch (error) {
    console.error("Error liking story:", error);
    res.status(500).json({ message: "Error liking story" });
  }
};

export const unlikeStory = async (req: Request, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    story.likes = Math.max(0, (story.likes || 0) - 1);
    await story.save();

    res.json({ likes: story.likes });
  } catch (error) {
    console.error("Error unliking story:", error);
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
    console.error("Error creating story:", error);
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
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

// Add a comment to a story
export const addComment = async (req: Request, res: Response) => {
  try {
    const { author, content } = req.body;

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
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};
