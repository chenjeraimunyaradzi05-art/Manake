import { Request, Response } from "express";
import { Types } from "mongoose";
import { Group } from "../models/Group";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { BadRequestError, NotFoundError, ForbiddenError } from "../errors";

// Helper type for ObjectId comparisons
type ObjectIdLike = Types.ObjectId | string;

// Get all groups (with optional filters)
export const getGroups = async (req: Request, res: Response) => {
  const { category, search, my } = req.query;
  const userId = req.user?.userId;
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;

  const query: Record<string, unknown> = {};

  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };
  if (my === "true" && userId) {
    query.members = userId;
  }

  const [groups, total] = await Promise.all([
    Group.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Group.countDocuments(query),
  ]);

  // Add member count
  const groupsWithCount = groups.map((g) => ({
    ...g,
    memberCount: g.members?.length || 0,
    isMember: userId ? g.members?.some((m: ObjectIdLike) => m.toString() === userId) : false,
    isAdmin: userId ? g.admins?.some((a: ObjectIdLike) => a.toString() === userId) : false,
  }));

  res.json({
    groups: groupsWithCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

// Get a single group by ID
export const getGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user?.userId;

  const group = await Group.findById(groupId)
    .populate("admins", "name avatar")
    .populate("moderators", "name avatar")
    .lean();

  if (!group) throw new NotFoundError("Group");

  res.json({
    ...group,
    memberCount: group.members?.length || 0,
    isMember: userId ? group.members?.some((m: ObjectIdLike) => m.toString() === userId) : false,
    isAdmin: userId ? group.admins?.some((a: { _id?: ObjectIdLike }) => a._id?.toString() === userId) : false,
    isModerator: userId ? group.moderators?.some((m: { _id?: ObjectIdLike }) => m._id?.toString() === userId) : false,
  });
};

// Create a new group
export const createGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { name, description, category, icon, isPrivate } = req.body;

  if (!name?.trim()) throw new BadRequestError("Group name is required");

  const group = await Group.create({
    name: name.trim(),
    description: description?.trim(),
    category,
    icon,
    isPrivate: isPrivate || false,
    members: [userId],
    admins: [userId],
    moderators: [],
  });

  res.status(201).json(group);
};

// Update a group
export const updateGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { groupId } = req.params;
  const updates = req.body;

  const group = await Group.findById(groupId);
  if (!group) throw new NotFoundError("Group");

  const isAdmin = group.admins.some((a: ObjectIdLike) => a.toString() === userId);
  if (!isAdmin) throw new ForbiddenError("Only admins can update this group");

  const allowedUpdates = ["name", "description", "category", "icon", "isPrivate"];
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      (group as any)[key] = updates[key];
    }
  }

  await group.save();
  res.json(group);
};

// Join a group
export const joinGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { groupId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) throw new NotFoundError("Group");

  if (group.members.some((m: ObjectIdLike) => m.toString() === userId)) {
    throw new BadRequestError("Already a member of this group");
  }

  if (group.isPrivate) {
    // For private groups, could implement a request system
    throw new BadRequestError("This is a private group. Request to join.");
  }

  group.members.push(userId as any);
  await group.save();

  res.json({ message: "Joined group successfully", memberCount: group.members.length });
};

// Leave a group
export const leaveGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { groupId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) throw new NotFoundError("Group");

  const memberIndex = group.members.findIndex((m: ObjectIdLike) => m.toString() === userId);
  if (memberIndex === -1) {
    throw new BadRequestError("Not a member of this group");
  }

  // Can't leave if you're the only admin
  const isOnlyAdmin = group.admins.length === 1 && group.admins[0].toString() === userId;
  if (isOnlyAdmin && group.members.length > 1) {
    throw new BadRequestError("Transfer admin role before leaving");
  }

  group.members.splice(memberIndex, 1);
  group.admins = group.admins.filter((a: ObjectIdLike) => a.toString() !== userId) as typeof group.admins;
  group.moderators = group.moderators.filter((m: ObjectIdLike) => m.toString() !== userId) as typeof group.moderators;
  await group.save();

  res.json({ message: "Left group successfully" });
};

// Get group members
export const getGroupMembers = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;

  const group = await Group.findById(groupId).lean();
  if (!group) throw new NotFoundError("Group");

  const memberIds = group.members.slice((page - 1) * limit, page * limit);

  const members = await User.find({ _id: { $in: memberIds } })
    .select("name avatar profile.headline")
    .lean();

  // Add role info
  const membersWithRoles = members.map((m) => ({
    ...m,
    role: group.admins.some((a: ObjectIdLike) => a.toString() === m._id.toString())
      ? "admin"
      : group.moderators.some((mod: ObjectIdLike) => mod.toString() === m._id.toString())
      ? "moderator"
      : "member",
  }));

  res.json({
    members: membersWithRoles,
    pagination: {
      page,
      limit,
      total: group.members.length,
      pages: Math.ceil(group.members.length / limit),
    },
  });
};

// Get group feed (posts in this group)
export const getGroupFeed = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  const group = await Group.findById(groupId);
  if (!group) throw new NotFoundError("Group");

  const [posts, total] = await Promise.all([
    Post.find({ group: groupId })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments({ group: groupId }),
  ]);

  res.json({
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// Create a post in a group
export const createGroupPost = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { groupId } = req.params;
  const { content, mediaUrl } = req.body;

  const group = await Group.findById(groupId);
  if (!group) throw new NotFoundError("Group");

  const isMember = group.members.some((m: ObjectIdLike) => m.toString() === userId);
  if (!isMember) throw new ForbiddenError("Must be a member to post");

  const post = await Post.create({
    author: userId,
    content: content?.trim(),
    mediaUrl,
    group: groupId,
    isPublic: !group.isPrivate,
  });

  const populated = await post.populate("author", "name avatar");
  res.status(201).json(populated);
};

// Delete a group (admin only)
export const deleteGroup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { groupId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) throw new NotFoundError("Group");

  const isAdmin = group.admins.some((a: ObjectIdLike) => a.toString() === userId);
  if (!isAdmin) throw new ForbiddenError("Only admins can delete this group");

  await Post.deleteMany({ group: groupId });
  await group.deleteOne();

  res.json({ message: "Group deleted successfully" });
};
