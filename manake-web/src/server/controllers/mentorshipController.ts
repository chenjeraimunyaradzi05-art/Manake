import { Request, Response } from "express";
import { Mentorship } from "../models/Mentorship";
import { User } from "../models/User";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { escapeRegex } from "../utils/regex";

// Get available mentors with filters
export const getMentors = async (req: Request, res: Response) => {
  try {
    const {
      specialization,
      availability,
      minRating,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const filter: Record<string, unknown> = {
      "mentorship.isMentor": true,
      "privacy.allowMentorRequests": { $ne: false },
    };

    // Filter by specialization
    if (specialization && specialization !== "all") {
      filter["mentorship.specializations"] = specialization;
    }

    // Filter by availability
    if (availability) {
      filter["mentorship.availability.hoursPerWeek"] = { $gte: Number(availability) };
    }

    // Filter by minimum rating
    if (minRating) {
      filter["mentorship.averageRating"] = { $gte: Number(minRating) };
    }

    // Search by name
    if (search) {
      const safeSearch = escapeRegex(String(search).trim().slice(0, 64));
      filter.name = { $regex: safeSearch, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [mentors, total] = await Promise.all([
      User.find(filter)
        .select("name avatar profile mentorship")
        .sort({ "mentorship.averageRating": -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      mentors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Get mentors error", { error });
    res.status(500).json({ error: "Failed to fetch mentors" });
  }
};

// Get featured mentors
export const getFeaturedMentors = async (_req: Request, res: Response) => {
  try {
    const mentors = await User.find({
      "mentorship.isMentor": true,
      "mentorship.averageRating": { $gte: 4.5 },
    })
      .select("name avatar profile mentorship")
      .sort({ "mentorship.averageRating": -1 })
      .limit(6);

    res.json({ mentors });
  } catch (error) {
    logger.error("Get featured mentors error", { error });
    res.status(500).json({ error: "Failed to fetch featured mentors" });
  }
};

// Get mentor details
export const getMentor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const mentor = await User.findOne({
      _id: id,
      "mentorship.isMentor": true,
    }).select("name avatar profile mentorship");

    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    // Get mentor's reviews from completed mentorships
    const reviews = await Mentorship.find({
      mentor: id,
      status: "completed",
      rating: { $exists: true },
    })
      .populate("mentee", "name avatar")
      .select("rating review endDate")
      .sort({ endDate: -1 })
      .limit(10);

    // Get active mentee count
    const activeMenteeCount = await Mentorship.countDocuments({
      mentor: id,
      status: "active",
    });

    res.json({
      mentor,
      reviews,
      activeMenteeCount,
    });
  } catch (error) {
      logger.error("Get mentor error", { error });
    res.status(500).json({ error: "Failed to fetch mentor details" });
  }
};

// Request mentorship
export const requestMentorship = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { mentorId, goals } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if mentor exists and accepts requests
    const mentor = await User.findOne({
      _id: mentorId,
      "mentorship.isMentor": true,
      "privacy.allowMentorRequests": { $ne: false },
    });

    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found or not accepting requests" });
    }

    // Check for existing pending/active mentorship
    const existing = await Mentorship.findOne({
      mentor: mentorId,
      mentee: userId,
      status: { $in: ["pending", "active"] },
    });

    if (existing) {
      return res.status(400).json({ error: "You already have a mentorship request with this mentor" });
    }

    const mentorship = await Mentorship.create({
      mentor: mentorId,
      mentee: userId,
      status: "pending",
      goals: goals || [],
    });

    res.status(201).json({ mentorship, message: "Mentorship request sent successfully" });
  } catch (error) {
      logger.error("Request mentorship error", { error });
    res.status(500).json({ error: "Failed to request mentorship" });
  }
};

// Get my mentorships (as mentor or mentee)
export const getMyMentorships = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { role, status } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const filter: Record<string, unknown> = {};

    if (role === "mentor") {
      filter.mentor = userId;
    } else if (role === "mentee") {
      filter.mentee = userId;
    } else {
      filter.$or = [{ mentor: userId }, { mentee: userId }];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const mentorships = await Mentorship.find(filter)
      .populate("mentor", "name avatar profile mentorship")
      .populate("mentee", "name avatar profile")
      .sort({ updatedAt: -1 });

    res.json({ mentorships });
  } catch (error) {
      logger.error("Get my mentorships error", { error });
    res.status(500).json({ error: "Failed to fetch mentorships" });
  }
};

// Get pending requests (for mentors)
export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const requests = await Mentorship.find({
      mentor: userId,
      status: "pending",
    })
      .populate("mentee", "name avatar profile")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    logger.error("Get pending requests error", { error });
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
};

// Accept mentorship request
export const acceptMentorship = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const mentorship = await Mentorship.findOneAndUpdate(
      { _id: id, mentor: userId, status: "pending" },
      { status: "active", startDate: new Date() },
      { new: true }
    )
      .populate("mentor", "name avatar")
      .populate("mentee", "name avatar");

    if (!mentorship) {
      return res.status(404).json({ error: "Mentorship request not found" });
    }

    res.json({ mentorship, message: "Mentorship request accepted" });
  } catch (error) {
      logger.error("Accept mentorship error", { error });
    res.status(500).json({ error: "Failed to accept mentorship" });
  }
};

// Decline mentorship request
export const declineMentorship = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const mentorship = await Mentorship.findOneAndDelete({
      _id: id,
      mentor: userId,
      status: "pending",
    });

    if (!mentorship) {
      return res.status(404).json({ error: "Mentorship request not found" });
    }

    res.json({ message: "Mentorship request declined" });
  } catch (error) {
      logger.error("Decline mentorship error", { error });
    res.status(500).json({ error: "Failed to decline mentorship" });
  }
};

// End mentorship
export const endMentorship = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const mentorship = await Mentorship.findOne({
      _id: id,
      status: "active",
      $or: [{ mentor: userId }, { mentee: userId }],
    });

    if (!mentorship) {
      return res.status(404).json({ error: "Active mentorship not found" });
    }

    mentorship.status = "completed";
    mentorship.endDate = new Date();
    
    // Only mentee can rate
    if (mentorship.mentee.toString() === userId) {
      if (rating) mentorship.rating = rating;
      if (review) mentorship.review = review;

      // Update mentor's average rating
      const mentorMentorships = await Mentorship.find({
        mentor: mentorship.mentor,
        status: "completed",
        rating: { $exists: true },
      });

      const avgRating =
        mentorMentorships.reduce((sum, m) => sum + (m.rating || 0), rating || 0) /
        (mentorMentorships.length + (rating ? 1 : 0));

      await User.findByIdAndUpdate(mentorship.mentor, {
        "mentorship.averageRating": avgRating,
      });
    }

    await mentorship.save();

    res.json({ mentorship, message: "Mentorship ended successfully" });
  } catch (error) {
      logger.error("End mentorship error", { error });
    res.status(500).json({ error: "Failed to end mentorship" });
  }
};

// Add meeting
export const addMeeting = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { date, duration, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const mentorship = await Mentorship.findOneAndUpdate(
      {
        _id: id,
        status: "active",
        $or: [{ mentor: userId }, { mentee: userId }],
      },
      {
        $push: {
          meetings: { date, duration, notes },
        },
      },
      { new: true }
    );

    if (!mentorship) {
      return res.status(404).json({ error: "Active mentorship not found" });
    }

    res.json({ mentorship, message: "Meeting added" });
  } catch (error) {
      logger.error("Add meeting error", { error });
    res.status(500).json({ error: "Failed to add meeting" });
  }
};

// Rate meeting (by mentee)
export const rateMeeting = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id, meetingId } = req.params;
    const { rating } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const mentorship = await Mentorship.findOneAndUpdate(
      {
        _id: id,
        mentee: userId,
        status: "active",
        "meetings._id": meetingId,
      },
      {
        $set: { "meetings.$.rating": rating },
      },
      { new: true }
    );

    if (!mentorship) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json({ mentorship, message: "Meeting rated" });
  } catch (error) {
      logger.error("Rate meeting error", { error });
    res.status(500).json({ error: "Failed to rate meeting" });
  }
};

// Become a mentor
export const becomeMentor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      mentorshipStyle,
      yearsInRecovery,
      specializations,
      availability,
      bio,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "mentorship.isMentor": true,
          "mentorship.mentorshipStyle": mentorshipStyle,
          "mentorship.yearsInRecovery": yearsInRecovery,
          "mentorship.specializations": specializations,
          "mentorship.availability": availability,
          "profile.bio": bio || undefined,
        },
      },
      { new: true }
    ).select("name avatar profile mentorship");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user, message: "You are now a mentor!" });
  } catch (error) {
      logger.error("Become mentor error", { error });
    res.status(500).json({ error: "Failed to become mentor" });
  }
};

// Update mentor settings
export const updateMentorSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateFields: Record<string, unknown> = {};
    
    if (updates.mentorshipStyle) updateFields["mentorship.mentorshipStyle"] = updates.mentorshipStyle;
    if (updates.specializations) updateFields["mentorship.specializations"] = updates.specializations;
    if (updates.availability) updateFields["mentorship.availability"] = updates.availability;
    if (updates.allowMentorRequests !== undefined) updateFields["privacy.allowMentorRequests"] = updates.allowMentorRequests;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("name avatar profile mentorship privacy");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user, message: "Mentor settings updated" });
  } catch (error) {
      logger.error("Update mentor settings error", { error });
    res.status(500).json({ error: "Failed to update mentor settings" });
  }
};

// Get mentorship stats
export const getMentorshipStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select("mentorship");
    const isMentor = user?.mentorship?.isMentor;

    const [
      asMentor,
      asMentee,
      pendingRequests,
    ] = await Promise.all([
      Mentorship.aggregate([
        { $match: { mentor: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Mentorship.aggregate([
        { $match: { mentee: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      isMentor
        ? Mentorship.countDocuments({ mentor: userId, status: "pending" })
        : 0,
    ]);

    const stats = {
      isMentor,
      asMentor: asMentor.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        { pending: 0, active: 0, completed: 0 }
      ),
      asMentee: asMentee.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        { pending: 0, active: 0, completed: 0 }
      ),
      pendingRequests,
    };

    res.json({ stats });
  } catch (error) {
      logger.error("Get mentorship stats error", { error });
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
