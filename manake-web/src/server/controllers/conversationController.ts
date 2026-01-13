import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { NotFoundError } from "../errors";

// Create or get existing direct conversation
export const getOrCreateDirectConversation = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user!.userId;
  const { recipientId } = req.body;

  let conversation = await Conversation.findOne({
    type: "direct",
    participants: { $all: [userId, recipientId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: "direct",
      participants: [userId, recipientId],
    });
  }

  // Populate participants details
  await conversation.populate("participants", "name avatar email");
  
  res.json(conversation);
};

// Create group conversation
export const createGroupConversation = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { name, participants, avatar } = req.body; // participants is array of IDs

  const allParticipants = [...new Set([userId, ...(participants || [])])];

  const conversation = await Conversation.create({
    type: "group",
    groupName: name,
    groupAvatar: avatar,
    participants: allParticipants,
    admins: [userId],
  });

  await conversation.populate("participants", "name avatar");
  res.status(201).json(conversation);
};

// List my conversations
export const listConversations = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name avatar email")
    .lean();

  res.json({ data: conversations });
};

// Get conversation details + messages
export const getConversationHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const conversation = await Conversation.findOne({
    _id: id,
    participants: userId
  }).populate("participants", "name avatar");

  if (!conversation) throw new NotFoundError("Conversation");

  // Get messages for this conversation
  // Note: We need to ensure Message model supports conversationId linking to Conversation model
  // We reused the existing Message model which had 'conversationId' as a string.
  // Ideally, existing Message model should be adapted or we use the field loosely.
  
  const messages = await Message.find({
    conversationId: id
  })
  .sort({ createdAt: 1 })
  .limit(100);

  res.json({ conversation, messages });
};
