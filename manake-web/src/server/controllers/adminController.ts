/**
 * Admin Controller
 * Provides admin dashboard functionality: analytics, moderation, user management
 */

import { Request, Response } from 'express';
import { Story } from '../models/Story';
import { User } from '../models/User';
import { Donation } from '../models/Donation';
import { Message } from '../models/Message';
import { NotFoundError, ForbiddenError } from '../errors';

// ============ Analytics ============

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalStories,
    pendingStories,
    totalDonations,
    donationsThisMonth,
    donationsLastMonth,
    totalMessages,
    unreadMessages,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Story.countDocuments({}),
    Story.countDocuments({ status: 'pending' }),
    Donation.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Donation.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Donation.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Message.countDocuments({}),
    Message.countDocuments({ status: { $ne: 'read' }, direction: 'inbound' }),
  ]);

  const donationStats = totalDonations[0] || { total: 0, count: 0 };
  const thisMonthStats = donationsThisMonth[0] || { total: 0, count: 0 };
  const lastMonthStats = donationsLastMonth[0] || { total: 0, count: 0 };

  res.json({
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
    },
    stories: {
      total: totalStories,
      pending: pendingStories,
    },
    donations: {
      totalAmount: donationStats.total / 100, // Convert cents to dollars
      totalCount: donationStats.count,
      thisMonth: {
        amount: thisMonthStats.total / 100,
        count: thisMonthStats.count,
      },
      lastMonth: {
        amount: lastMonthStats.total / 100,
        count: lastMonthStats.count,
      },
    },
    messages: {
      total: totalMessages,
      unread: unreadMessages,
    },
  });
};

export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  const limit = Number(req.query.limit) || 20;

  const [recentStories, recentDonations, recentUsers] = await Promise.all([
    Story.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title author.name category createdAt'),
    Donation.find({ status: 'succeeded' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('donorName amount isAnonymous createdAt'),
    User.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email createdAt'),
  ]);

  res.json({
    stories: recentStories,
    donations: recentDonations.map((d) => ({
      ...d.toObject(),
      amount: (d.amount || 0) / 100,
      donorName: d.isAnonymous ? 'Anonymous' : d.donorName,
    })),
    users: recentUsers,
  });
};

// ============ Story Moderation ============

export const getPendingStories = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    Story.find({ status: 'pending' }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Story.countDocuments({ status: 'pending' }),
  ]);

  res.json({
    data: stories,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const approveStory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const story = await Story.findByIdAndUpdate(
    id,
    { status: 'published', publishedAt: new Date() },
    { new: true }
  );

  if (!story) throw new NotFoundError('Story');

  res.json({ message: 'Story approved', data: story });
};

export const rejectStory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body as { reason?: string };

  const story = await Story.findByIdAndUpdate(
    id,
    { status: 'rejected', rejectionReason: reason },
    { new: true }
  );

  if (!story) throw new NotFoundError('Story');

  res.json({ message: 'Story rejected', data: story });
};

export const featureStory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { featured } = req.body as { featured: boolean };

  const story = await Story.findByIdAndUpdate(id, { featured }, { new: true });

  if (!story) throw new NotFoundError('Story');

  res.json({ message: featured ? 'Story featured' : 'Story unfeatured', data: story });
};

export const deleteStory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const story = await Story.findByIdAndDelete(id);

  if (!story) throw new NotFoundError('Story');

  res.json({ message: 'Story deleted' });
};

// ============ User Management ============

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email role isActive isEmailVerified createdAt lastLogin'),
    User.countDocuments(filter),
  ]);

  res.json({
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select('-passwordHash');

  if (!user) throw new NotFoundError('User');

  res.json({ data: user });
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body as { role: 'user' | 'admin' | 'moderator' };
  const actorRole = req.user?.role;

  // Only admins can promote to admin
  if (role === 'admin' && actorRole !== 'admin') {
    throw new ForbiddenError('Only admins can assign admin role');
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');

  if (!user) throw new NotFoundError('User');

  res.json({ message: 'User role updated', data: user });
};

export const toggleUserActive = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) throw new NotFoundError('User');

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: user.isActive ? 'User activated' : 'User deactivated',
    data: { id: user._id, isActive: user.isActive },
  });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user?.userId === id) {
    throw new ForbiddenError('Cannot delete your own account via admin panel');
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) throw new NotFoundError('User');

  res.json({ message: 'User deleted' });
};
