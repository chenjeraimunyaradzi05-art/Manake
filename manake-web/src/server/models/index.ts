/**
 * Models Index
 * Re-exports Prisma client and generated types (PostgreSQL via Prisma ORM)
 */

export { prisma } from "../config/prisma";
export type {
  User,
  RefreshToken,
  Donation,
  Story,
  StoryComment,
  StoryLike,
  Post,
  PostLike,
  PostComment,
  InternalPost,
  Contact,
  Connection,
  Mentorship,
  Notification,
  Message,
  Conversation,
  Group,
  GroupMember,
  WebhookEvent,
  PushToken,
  SocialAccount,
  SocialPostMetric,
} from "@prisma/client";
