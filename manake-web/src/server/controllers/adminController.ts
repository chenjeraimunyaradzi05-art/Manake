/**
 * Admin Controller
 * Provides admin dashboard functionality: analytics, moderation, user management
 */

import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { NotFoundError, ForbiddenError } from "../errors";

// ============ Analytics ============

export const getDashboardStats = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalStories,
    pendingStories,
    donationStats,
    donationsThisMonth,
    donationsLastMonth,
    totalMessages,
    unreadMessages,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.story.count(),
    prisma.story.count({ where: { status: "pending" } }),
    prisma.donation.aggregate({
      where: { status: { in: ["completed", "succeeded"] } },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.aggregate({
      where: {
        status: { in: ["completed", "succeeded"] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.aggregate({
      where: {
        status: { in: ["completed", "succeeded"] },
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.message.count(),
    prisma.message.count({
      where: { NOT: { status: "read" }, direction: "inbound" },
    }),
  ]);

  res.json({
    users: { total: totalUsers, newThisMonth: newUsersThisMonth },
    stories: { total: totalStories, pending: pendingStories },
    donations: {
      totalAmount: donationStats._sum.amount ?? 0,
      totalCount: donationStats._count.id,
      thisMonth: {
        amount: donationsThisMonth._sum.amount ?? 0,
        count: donationsThisMonth._count.id,
      },
      lastMonth: {
        amount: donationsLastMonth._sum.amount ?? 0,
        count: donationsLastMonth._count.id,
      },
    },
    messages: { total: totalMessages, unread: unreadMessages },
  });
};

export const getRecentActivity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const limit = Number(req.query.limit) || 20;

  const [recentStories, recentDonations, recentUsers] = await Promise.all([
    prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        authorName: true,
        category: true,
        createdAt: true,
      },
    }),
    prisma.donation.findMany({
      where: { status: { in: ["completed", "succeeded"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        donorName: true,
        amount: true,
        isAnonymous: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  res.json({
    stories: recentStories,
    donations: recentDonations.map((d) => ({
      ...d,
      amount: d.amount || 0,
      donorName: d.isAnonymous ? "Anonymous" : d.donorName,
    })),
    users: recentUsers,
  });
};

// ============ Story Moderation ============

export const getPendingStories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.story.count({ where: { status: "pending" } }),
  ]);

  res.json({
    data: stories,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const approveStory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) throw new NotFoundError("Story");
  const updated = await prisma.story.update({
    where: { id },
    data: { status: "published", publishedAt: new Date() },
  });
  res.json({ message: "Story approved", data: updated });
};

export const rejectStory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body as { reason?: string };

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) throw new NotFoundError("Story");
  const updated = await prisma.story.update({
    where: { id },
    data: { status: "rejected", rejectionReason: reason },
  });
  res.json({ message: "Story rejected", data: updated });
};

export const featureStory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { featured } = req.body as { featured: boolean };

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) throw new NotFoundError("Story");
  const updated = await prisma.story.update({
    where: { id },
    data: { featured },
  });
  res.json({
    message: featured ? "Story featured" : "Story unfeatured",
    data: updated,
  });
};

export const deleteStory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) throw new NotFoundError("Story");
  await prisma.story.delete({ where: { id } });
  res.json({ message: "Story deleted" });
};

// ============ User Management ============

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        lastLogin: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    omit: { passwordHash: true },
  } as Parameters<typeof prisma.user.findUnique>[0]);

  if (!user) throw new NotFoundError("User");
  res.json({ data: user });
};

export const updateUserRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body as { role: "user" | "admin" | "moderator" };
  const actorRole = req.user?.role;

  // Only admins can promote to admin
  if (role === "admin" && actorRole !== "admin") {
    throw new ForbiddenError("Only admins can assign admin role");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("User");
  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
    },
  });
  res.json({ message: "User role updated", data: user });
};

export const toggleUserActive = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("User");
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: !existing.isActive },
    select: { id: true, isActive: true },
  });
  res.json({
    message: user.isActive ? "User activated" : "User deactivated",
    data: user,
  });
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user?.userId === id) {
    throw new ForbiddenError("Cannot delete your own account via admin panel");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User");
  await prisma.user.delete({ where: { id } });
  res.json({ message: "User deleted" });
};
