import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { NotFoundError } from "../errors";

// Create or get existing direct conversation
export const getOrCreateDirectConversation = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user!.userId;
  const { recipientId } = req.body;

  let conversation = await prisma.conversation.findFirst({
    where: {
      type: "direct",
      AND: [
        { participants: { has: userId } },
        { participants: { has: recipientId } },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        type: "direct",
        participants: [userId, recipientId],
        admins: [],
      },
    });
  }

  // Fetch participant details
  const participantUsers = await prisma.user.findMany({
    where: { id: { in: conversation.participants } },
    select: { id: true, name: true, avatar: true, email: true },
  });

  res.json({ ...conversation, participantDetails: participantUsers });
};

// Create group conversation
export const createGroupConversation = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { name, participants, avatar } = req.body;

  const allParticipants = [
    ...new Set([userId, ...((participants as string[]) || [])]),
  ];

  const conversation = await prisma.conversation.create({
    data: {
      type: "group",
      groupName: name,
      groupAvatar: avatar,
      participants: allParticipants,
      admins: [userId],
    },
  });

  const participantUsers = await prisma.user.findMany({
    where: { id: { in: conversation.participants } },
    select: { id: true, name: true, avatar: true },
  });

  res
    .status(201)
    .json({ ...conversation, participantDetails: participantUsers });
};

// List my conversations
export const listConversations = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const conversations = await prisma.conversation.findMany({
    where: { participants: { has: userId } },
    orderBy: { lastMessageAt: "desc" },
  });

  res.json({ data: conversations });
};

// Get conversation details + messages
export const getConversationHistory = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  const conversation = await prisma.conversation.findFirst({
    where: { id, participants: { has: userId } },
  });

  if (!conversation) throw new NotFoundError("Conversation");

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  res.json({ conversation, messages });
};
