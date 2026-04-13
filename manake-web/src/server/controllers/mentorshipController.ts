import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";
import { escapeRegex } from "../utils/regex";

const MENTOR_USER_SELECT = {
  id: true,
  name: true,
  avatar: true,
  bio: true,
  headline: true,
  isMentor: true,
  mentorshipStyle: true,
  yearsInRecovery: true,
  specializations: true,
  mentorHoursPerWeek: true,
  mentorPreferredTimes: true,
  mentorAverageRating: true,
} as const;

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

    const safe = search
      ? escapeRegex(String(search).trim().slice(0, 64))
      : null;
    const mentorWhere = {
      isMentor: true,
      allowMentorRequests: true,
      ...(specialization && specialization !== "all"
        ? { specializations: { has: specialization as string } }
        : {}),
      ...(availability
        ? { mentorHoursPerWeek: { gte: Number(availability) } }
        : {}),
      ...(minRating ? { mentorAverageRating: { gte: Number(minRating) } } : {}),
      ...(safe
        ? { name: { contains: safe, mode: "insensitive" as const } }
        : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [mentors, total] = await Promise.all([
      prisma.user.findMany({
        where: mentorWhere,
        select: MENTOR_USER_SELECT,
        orderBy: { mentorAverageRating: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where: mentorWhere }),
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
    const mentors = await prisma.user.findMany({
      where: { isMentor: true, mentorAverageRating: { gte: 4.5 } },
      select: MENTOR_USER_SELECT,
      orderBy: { mentorAverageRating: "desc" },
      take: 6,
    });
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

    const mentor = await prisma.user.findFirst({
      where: { id, isMentor: true },
      select: MENTOR_USER_SELECT,
    });

    if (!mentor) return res.status(404).json({ error: "Mentor not found" });

    const [reviews, activeMenteeCount] = await Promise.all([
      prisma.mentorship.findMany({
        where: { mentorId: id, status: "completed", NOT: { rating: null } },
        select: {
          id: true,
          rating: true,
          review: true,
          endDate: true,
          mentee: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { endDate: "desc" },
        take: 10,
      }),
      prisma.mentorship.count({ where: { mentorId: id, status: "active" } }),
    ]);

    res.json({ mentor, reviews, activeMenteeCount });
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

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const mentor = await prisma.user.findFirst({
      where: { id: mentorId, isMentor: true, allowMentorRequests: true },
    });
    if (!mentor)
      return res
        .status(404)
        .json({ error: "Mentor not found or not accepting requests" });

    const existing = await prisma.mentorship.findFirst({
      where: {
        mentorId,
        menteeId: userId,
        status: { in: ["pending", "active"] },
      },
    });
    if (existing)
      return res
        .status(400)
        .json({
          error: "You already have a mentorship request with this mentor",
        });

    const mentorship = await prisma.mentorship.create({
      data: {
        mentorId,
        menteeId: userId,
        status: "pending",
        goals: goals || [],
      },
    });

    res
      .status(201)
      .json({ mentorship, message: "Mentorship request sent successfully" });
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

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const mentorshipWhere = {
      ...(role === "mentor"
        ? { mentorId: userId }
        : role === "mentee"
          ? { menteeId: userId }
          : { OR: [{ mentorId: userId }, { menteeId: userId }] }),
      ...(status && status !== "all" ? { status: status as string } : {}),
    };

    const mentorships = await prisma.mentorship.findMany({
      where: mentorshipWhere,
      include: {
        mentor: { select: MENTOR_USER_SELECT },
        mentee: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            headline: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

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
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const requests = await prisma.mentorship.findMany({
      where: { mentorId: userId, status: "pending" },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            headline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const existing = await prisma.mentorship.findFirst({
      where: { id, mentorId: userId, status: "pending" },
    });
    if (!existing)
      return res.status(404).json({ error: "Mentorship request not found" });

    const mentorship = await prisma.mentorship.update({
      where: { id },
      data: { status: "active", startDate: new Date() },
      include: {
        mentor: { select: { id: true, name: true, avatar: true } },
        mentee: { select: { id: true, name: true, avatar: true } },
      },
    });

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
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const existing = await prisma.mentorship.findFirst({
      where: { id, mentorId: userId, status: "pending" },
    });
    if (!existing)
      return res.status(404).json({ error: "Mentorship request not found" });

    await prisma.mentorship.delete({ where: { id } });
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
    const { rating, review } = req.body as { rating?: number; review?: string };
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const existing = await prisma.mentorship.findFirst({
      where: {
        id,
        status: "active",
        OR: [{ mentorId: userId }, { menteeId: userId }],
      },
    });
    if (!existing)
      return res.status(404).json({ error: "Active mentorship not found" });

    const data: Record<string, unknown> = {
      status: "completed",
      endDate: new Date(),
    };

    if (existing.menteeId === userId && rating) {
      data.rating = rating;
      if (review) data.review = review;

      // Recalculate mentor's average rating
      const completed = await prisma.mentorship.findMany({
        where: {
          mentorId: existing.mentorId,
          status: "completed",
          NOT: { rating: null },
        },
        select: { rating: true },
      });
      const allRatings = [...completed.map((m) => m.rating ?? 0), rating];
      const avgRating =
        allRatings.reduce((s, r) => s + r, 0) / allRatings.length;
      await prisma.user.update({
        where: { id: existing.mentorId },
        data: { mentorAverageRating: avgRating },
      });
    }

    const mentorship = await prisma.mentorship.update({ where: { id }, data });
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
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const existing = await prisma.mentorship.findFirst({
      where: {
        id,
        status: "active",
        OR: [{ mentorId: userId }, { menteeId: userId }],
      },
    });
    if (!existing)
      return res.status(404).json({ error: "Active mentorship not found" });

    const meetings = (
      Array.isArray(existing.meetings) ? existing.meetings : []
    ) as Record<string, unknown>[];
    meetings.push({ id: `${Date.now()}`, date, duration, notes });

    const mentorship = await prisma.mentorship.update({
      where: { id },
      data: { meetings },
    });

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
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const existing = await prisma.mentorship.findFirst({
      where: { id, menteeId: userId, status: "active" },
    });
    if (!existing)
      return res.status(404).json({ error: "Mentorship not found" });

    const meetings = (
      Array.isArray(existing.meetings) ? existing.meetings : []
    ) as Record<string, unknown>[];
    const idx = meetings.findIndex((m) => m.id === meetingId);
    if (idx === -1) return res.status(404).json({ error: "Meeting not found" });

    meetings[idx] = { ...meetings[idx], rating };
    const mentorship = await prisma.mentorship.update({
      where: { id },
      data: { meetings },
    });

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
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return res.status(404).json({ error: "User not found" });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isMentor: true,
        mentorshipStyle,
        yearsInRecovery: yearsInRecovery ? Number(yearsInRecovery) : undefined,
        specializations: specializations || [],
        mentorHoursPerWeek: availability?.hoursPerWeek
          ? Number(availability.hoursPerWeek)
          : undefined,
        ...(bio ? { bio } : {}),
      },
      select: MENTOR_USER_SELECT,
    });

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
    const updates = req.body as Record<string, unknown>;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const data: Record<string, unknown> = {};
    if (updates.mentorshipStyle) data.mentorshipStyle = updates.mentorshipStyle;
    if (updates.specializations) data.specializations = updates.specializations;
    if (updates.allowMentorRequests !== undefined)
      data.allowMentorRequests = updates.allowMentorRequests;
    if (updates.hoursPerWeek)
      data.mentorHoursPerWeek = Number(updates.hoursPerWeek);

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return res.status(404).json({ error: "User not found" });

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: MENTOR_USER_SELECT,
    });

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

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isMentor: true },
    });
    const isMentor = dbUser?.isMentor;

    const [asMentorGroups, asMenteeGroups, pendingRequests] = await Promise.all(
      [
        prisma.mentorship.groupBy({
          by: ["status"],
          where: { mentorId: userId },
          _count: { id: true },
        }),
        prisma.mentorship.groupBy({
          by: ["status"],
          where: { menteeId: userId },
          _count: { id: true },
        }),
        isMentor
          ? prisma.mentorship.count({
              where: { mentorId: userId, status: "pending" },
            })
          : 0,
      ],
    );

    const toStatusMap = (rows: { status: string; _count: { id: number } }[]) =>
      rows.reduce((acc, r) => ({ ...acc, [r.status]: r._count.id }), {
        pending: 0,
        active: 0,
        completed: 0,
      });

    const stats = {
      isMentor,
      asMentor: toStatusMap(asMentorGroups),
      asMentee: toStatusMap(asMenteeGroups),
      pendingRequests,
    };

    res.json({ stats });
  } catch (error) {
    logger.error("Get mentorship stats error", { error });
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
