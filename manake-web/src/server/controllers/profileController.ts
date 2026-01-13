import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { Connection } from "../models/Connection";
import { Post } from "../models/Post";
import { NotFoundError, BadRequestError } from "../errors";

// Get a user's public profile
export const getProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user?.userId;

  const user = await User.findById(userId)
    .select("-passwordHash -emailVerificationToken -passwordResetToken -passwordResetExpires")
    .lean();

  if (!user) throw new NotFoundError("User");

  // Check privacy settings
  const privacy = user.privacy || { visibility: "public" };
  const isOwnProfile = currentUserId === userId;

  if (!isOwnProfile && privacy.visibility === "private") {
    return res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      isPrivate: true,
    });
  }

  // Check if connection-only and not connected
  if (!isOwnProfile && privacy.visibility === "connections-only") {
    const connection = await Connection.findOne({
      $or: [
        { userId: currentUserId, connectedUserId: userId, status: "accepted" },
        { userId, connectedUserId: currentUserId, status: "accepted" },
      ],
    });

    if (!connection) {
      return res.json({
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        profile: { headline: user.profile?.headline },
        isConnectionsOnly: true,
      });
    }
  }

  res.json({ ...user, isOwnProfile });
};

// Get user's recent activity (posts)
export const getUserActivity = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;

  const activity = await Post.find({ author: userId, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(activity);
};

// Get user's stats
export const getUserStats = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const [connectionsCount, postsCount] = await Promise.all([
    Connection.countDocuments({
      $or: [{ userId }, { connectedUserId: userId }],
      status: "accepted",
    }),
    Post.countDocuments({ author: userId, isPublic: true }),
  ]);

  res.json({
    connections: connectionsCount,
    posts: postsCount,
  });
};

// Update own profile
export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updates = req.body as Partial<IUser>;

  // Only allow certain fields to be updated
  const allowedUpdates = {
    name: updates.name,
    avatar: updates.avatar,
    profile: updates.profile,
    mentorship: updates.mentorship,
    privacy: updates.privacy,
    preferences: updates.preferences,
  };

  // Validate bio length
  if (allowedUpdates.profile?.bio && allowedUpdates.profile.bio.length > 500) {
    throw new BadRequestError("Bio cannot exceed 500 characters");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).select("-passwordHash -emailVerificationToken -passwordResetToken -passwordResetExpires");

  if (!user) throw new NotFoundError("User");

  res.json(user);
};

// Get mutual connections
export const getMutualConnections = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 5;

  // Get current user's connections
  const myConnections = await Connection.find({
    $or: [{ userId: currentUserId }, { connectedUserId: currentUserId }],
    status: "accepted",
  }).lean();

  const myConnectionIds = new Set<string>();
  for (const c of myConnections) {
    if (c.userId.toString() !== currentUserId) myConnectionIds.add(c.userId.toString());
    if (c.connectedUserId.toString() !== currentUserId) myConnectionIds.add(c.connectedUserId.toString());
  }

  // Get target user's connections
  const theirConnections = await Connection.find({
    $or: [{ userId }, { connectedUserId: userId }],
    status: "accepted",
  }).lean();

  const mutualIds: string[] = [];
  for (const c of theirConnections) {
    const otherId = c.userId.toString() === userId ? c.connectedUserId.toString() : c.userId.toString();
    if (myConnectionIds.has(otherId)) {
      mutualIds.push(otherId);
    }
  }

  const mutuals = await User.find({ _id: { $in: mutualIds.slice(0, limit) } })
    .select("name avatar profile.headline")
    .lean();

  res.json({
    mutuals,
    totalCount: mutualIds.length,
  });
};
