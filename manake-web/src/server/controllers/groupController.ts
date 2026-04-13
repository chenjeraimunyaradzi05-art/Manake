import { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { BadRequestError, NotFoundError, ForbiddenError } from "../errors";

// Get all groups (with optional filters)
export const getGroups = async (req: Request, res: Response) => {
  const { category, search, my } = req.query;
  const userId = req.user?.userId;
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;

  const groupWhere: Prisma.GroupWhereInput = {
    ...(category ? { category: category as string } : {}),
    ...(search
      ? { name: { contains: search as string, mode: "insensitive" as const } }
      : {}),
    ...(my === "true" && userId ? { members: { some: { userId } } } : {}),
  };

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where: groupWhere,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { members: { select: { userId: true, role: true } } },
    }),
    prisma.group.count({ where: groupWhere }),
  ]);

  const result = groups.map(({ members, ...g }) => ({
    ...g,
    memberCount: members.length,
    isMember: userId ? members.some((m) => m.userId === userId) : false,
    isAdmin: userId
      ? members.some((m) => m.userId === userId && m.role === "admin")
      : false,
  }));

  res.json({
    groups: result,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// Get a single group by ID
export const getGroup = async (req: Request, res: Response) => {
  const groupId = req.params.groupId as string;
  const userId = req.user?.userId;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });

  if (!group) throw new NotFoundError("Group");

  const admins = group.members
    .filter((m) => m.role === "admin")
    .map((m) => m.user);
  const moderators = group.members
    .filter((m) => m.role === "moderator")
    .map((m) => m.user);

  res.json({
    ...group,
    memberCount: group.members.length,
    isMember: userId ? group.members.some((m) => m.userId === userId) : false,
    isAdmin: userId
      ? group.members.some((m) => m.userId === userId && m.role === "admin")
      : false,
    isModerator: userId
      ? group.members.some((m) => m.userId === userId && m.role === "moderator")
      : false,
    admins,
    moderators,
  });
};

// Create a new group
export const createGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { name, description, category, icon, isPrivate } = req.body;

  if (!name?.trim()) throw new BadRequestError("Group name is required");

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      category,
      icon,
      isPrivate: isPrivate || false,
      members: { create: { userId, role: "admin" } },
    },
    include: { members: true },
  });

  res.status(201).json(group);
};

// Update a group
export const updateGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const groupId = req.params.groupId as string;
  const updates = req.body as Record<string, unknown>;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { select: { userId: true, role: true } } },
  });
  if (!group) throw new NotFoundError("Group");

  if (!group.members.some((m) => m.userId === userId && m.role === "admin")) {
    throw new ForbiddenError("Only admins can update this group");
  }

  const data: Record<string, unknown> = {};
  for (const key of ["name", "description", "category", "icon", "isPrivate"]) {
    if (updates[key] !== undefined) data[key] = updates[key];
  }

  const updated = await prisma.group.update({ where: { id: groupId }, data });
  res.json(updated);
};

// Join a group
export const joinGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const groupId = req.params.groupId as string;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { select: { userId: true } } },
  });
  if (!group) throw new NotFoundError("Group");

  if (group.members.some((m) => m.userId === userId)) {
    throw new BadRequestError("Already a member of this group");
  }
  if (group.isPrivate)
    throw new BadRequestError("This is a private group. Request to join.");

  await prisma.groupMember.create({
    data: { userId, groupId, role: "member" },
  });

  res.json({
    message: "Joined group successfully",
    memberCount: group.members.length + 1,
  });
};

// Leave a group
export const leaveGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const groupId = req.params.groupId as string;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { select: { userId: true, role: true } } },
  });
  if (!group) throw new NotFoundError("Group");

  if (!group.members.some((m) => m.userId === userId)) {
    throw new BadRequestError("Not a member of this group");
  }

  const admins = group.members.filter((m) => m.role === "admin");
  if (
    admins.length === 1 &&
    admins[0].userId === userId &&
    group.members.length > 1
  ) {
    throw new BadRequestError("Transfer admin role before leaving");
  }

  await prisma.groupMember.delete({
    where: { userId_groupId: { userId, groupId } },
  });
  res.json({ message: "Left group successfully" });
};

// Get group members
export const getGroupMembers = async (req: Request, res: Response) => {
  const groupId = req.params.groupId as string;
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;

  const [members, total] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, headline: true },
        },
      },
    }),
    prisma.groupMember.count({ where: { groupId } }),
  ]);

  res.json({
    members: members.map((m) => ({ ...m.user, role: m.role })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// Get group feed — Post model has no group relation; returns empty until schema updated
export const getGroupFeed = async (_req: Request, res: Response) => {
  res.json({
    posts: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  });
};

// Create a post in a group — stubbed until Post model gains group relation
export const createGroupPost = async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Group posts not yet supported" });
};

// Delete a group (admin only)
export const deleteGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const groupId = req.params.groupId as string;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { select: { userId: true, role: true } } },
  });
  if (!group) throw new NotFoundError("Group");

  if (!group.members.some((m) => m.userId === userId && m.role === "admin")) {
    throw new ForbiddenError("Only admins can delete this group");
  }

  await prisma.group.delete({ where: { id: groupId } });
  res.json({ message: "Group deleted successfully" });
};
