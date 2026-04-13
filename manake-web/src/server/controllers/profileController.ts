import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { NotFoundError, BadRequestError } from "../errors";

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
  bio: true,
  headline: true,
  bannerImage: true,
  location: true,
  interests: true,
  skills: true,
  isMentor: true,
  visibility: true,
  isActive: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Get a user's public profile
export const getProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });

  if (!user) throw new NotFoundError("User");

  const isOwnProfile = currentUserId === userId;

  if (!isOwnProfile && user.visibility === "private") {
    return res.json({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      isPrivate: true,
    });
  }

  if (!isOwnProfile && user.visibility === "connections-only") {
    const connection = await prisma.connection.findFirst({
      where: {
        status: "accepted",
        OR: [
          { userId: currentUserId, connectedUserId: userId },
          { userId, connectedUserId: currentUserId },
        ],
      },
    });
    if (!connection) {
      return res.json({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        headline: user.headline,
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

  const activity = await prisma.post.findMany({
    where: { authorId: userId, scope: "public" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  res.json(activity);
};

// Get user's stats
export const getUserStats = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const [connectionsCount, postsCount] = await Promise.all([
    prisma.connection.count({
      where: {
        status: "accepted",
        OR: [{ userId }, { connectedUserId: userId }],
      },
    }),
    prisma.post.count({ where: { authorId: userId, scope: "public" } }),
  ]);

  res.json({ connections: connectionsCount, posts: postsCount });
};

// Update own profile
export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const body = req.body as Record<string, unknown>;

  // Map nested API fields to flat Prisma columns
  const profile = (body.profile as Record<string, unknown>) || {};
  const privacy = (body.privacy as Record<string, unknown>) || {};
  const prefs = (body.preferences as Record<string, unknown>) || {};
  const mentorship = (body.mentorship as Record<string, unknown>) || {};

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.avatar !== undefined) data.avatar = body.avatar;
  if (profile.bio !== undefined) {
    if (typeof profile.bio === "string" && profile.bio.length > 500) {
      throw new BadRequestError("Bio cannot exceed 500 characters");
    }
    data.bio = profile.bio;
  }
  if (profile.headline !== undefined) data.headline = profile.headline;
  if (profile.location !== undefined) data.location = profile.location;
  if (profile.interests !== undefined) data.interests = profile.interests;
  if (profile.skills !== undefined) data.skills = profile.skills;
  if (privacy.visibility !== undefined) data.visibility = privacy.visibility;
  if (privacy.allowMessages !== undefined)
    data.allowMessages = privacy.allowMessages;
  if (privacy.allowMentorRequests !== undefined)
    data.allowMentorRequests = privacy.allowMentorRequests;
  if (prefs.emailNotifications !== undefined)
    data.emailNotifications = prefs.emailNotifications;
  if (prefs.pushNotifications !== undefined)
    data.pushNotifications = prefs.pushNotifications;
  if (mentorship.isMentor !== undefined) data.isMentor = mentorship.isMentor;
  if (mentorship.specializations !== undefined)
    data.specializations = mentorship.specializations;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new NotFoundError("User");

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_USER_SELECT,
  });

  res.json(user);
};

// Get mutual connections
export const getMutualConnections = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 5;

  const [myConnections, theirConnections] = await Promise.all([
    prisma.connection.findMany({
      where: {
        status: "accepted",
        OR: [{ userId: currentUserId }, { connectedUserId: currentUserId }],
      },
      select: { userId: true, connectedUserId: true },
    }),
    prisma.connection.findMany({
      where: {
        status: "accepted",
        OR: [{ userId }, { connectedUserId: userId }],
      },
      select: { userId: true, connectedUserId: true },
    }),
  ]);

  const myConnectionIds = new Set<string>();
  for (const c of myConnections) {
    if (c.userId !== currentUserId) myConnectionIds.add(c.userId);
    if (c.connectedUserId !== currentUserId)
      myConnectionIds.add(c.connectedUserId);
  }

  const mutualIds: string[] = [];
  for (const c of theirConnections) {
    const otherId = c.userId === userId ? c.connectedUserId : c.userId;
    if (myConnectionIds.has(otherId)) mutualIds.push(otherId);
  }

  const mutuals = await prisma.user.findMany({
    where: { id: { in: mutualIds.slice(0, limit) } },
    select: { id: true, name: true, avatar: true, headline: true },
  });

  res.json({ mutuals, totalCount: mutualIds.length });
};
