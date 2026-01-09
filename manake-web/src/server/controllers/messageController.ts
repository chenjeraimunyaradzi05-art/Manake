import { Request, Response } from "express";
import { Message } from "../models/Message";
import { ApiError, NotFoundError, UnauthorizedError } from "../errors";
import { sendUnifiedMessage } from "../services/messagingService";

const isPrivilegedRole = (role: unknown): boolean =>
  role === "admin" || role === "moderator";

interface MongooseDocument {
  toObject: () => Record<string, unknown>;
  _id?: { toString(): string };
}

const toMessageDto = (message: unknown): Record<string, unknown> => {
  const isMongooseDoc = (obj: unknown): obj is MongooseDocument =>
    obj !== null && typeof obj === "object" && "toObject" in obj;

  const raw: Record<string, unknown> = isMongooseDoc(message)
    ? message.toObject()
    : (message as Record<string, unknown>) || {};

  const rawId = raw._id as { toString(): string } | string | undefined;
  const id =
    (raw.id as string) ??
    (typeof rawId === "object" ? rawId?.toString() : rawId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, ...rest } = raw;
  return {
    ...rest,
    ...(id ? { id } : {}),
  };
};

export const createMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    channel,
    direction,
    status,
    senderPhone,
    senderEmail,
    senderName,
    recipientPhone,
    recipientEmail,
    content,
    contentType,
    mediaUrl,
    metadata,
    conversationId,
  } = req.body;

  const message = await Message.create({
    channel,
    direction,
    status: status || "pending",
    senderPhone,
    senderEmail,
    senderName,
    recipientPhone,
    recipientEmail,
    content,
    contentType,
    mediaUrl,
    metadata: metadata || {},
    conversationId: conversationId || senderEmail || senderPhone,
    sentAt: direction === "outbound" ? new Date() : undefined,
  });

  res.status(201).json({
    message: "Message stored",
    data: toMessageDto(message),
  });
};

export const listMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const status = req.query.status as string | undefined;
  const channel = req.query.channel as string | undefined;

  const actor = req.user;
  const targetUserId = actor?.userId;
  const allowGlobal = actor ? isPrivilegedRole(actor.role) : true;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (channel) filter.channel = channel;
  if (!allowGlobal && targetUserId) filter.userId = targetUserId;
  if (!allowGlobal && !targetUserId) {
    throw new UnauthorizedError("Authentication required");
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments(filter),
  ]);

  res.json({
    data: Array.isArray(messages) ? messages.map(toMessageDto) : [],
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const message = await Message.findById(id);

  if (!message) {
    throw new NotFoundError("Message");
  }

  res.json({ data: toMessageDto(message) });
};

export const updateMessageStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { status, failureReason } = req.body;

  const message = await Message.findByIdAndUpdate(
    id,
    {
      status,
      failureReason,
      failedAt: status === "failed" ? new Date() : undefined,
      deliveredAt: status === "delivered" ? new Date() : undefined,
      readAt: status === "read" ? new Date() : undefined,
    },
    { new: true },
  );

  if (!message) {
    throw new NotFoundError("Message");
  }

  res.json({
    message: "Message updated",
    data: toMessageDto(message),
  });
};

export const deleteMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const deleted = await Message.findByIdAndDelete(id);

  if (!deleted) {
    throw new ApiError("Message not found", 404, "NOT_FOUND");
  }

  res.json({ message: "Message deleted" });
};

export const sendMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new UnauthorizedError("Authentication required");
  }

  const { channels, message, recipientPhone, recipientId, mediaUrl } =
    req.body as {
      channels: Array<
        "whatsapp" | "instagram" | "facebook" | "inapp" | "sms" | "email"
      >;
      message: string;
      recipientPhone?: string;
      recipientId?: string;
      mediaUrl?: string;
    };

  const results = await sendUnifiedMessage({
    userId: req.user.userId,
    channels,
    message,
    recipientPhone,
    recipientId,
    mediaUrl,
  });

  res.json({ results });
};

export const markMessageRead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new UnauthorizedError("Authentication required");
  }

  const { id } = req.params;
  const actor = req.user;
  const privileged = isPrivilegedRole(actor.role);

  const updated = await Message.findOneAndUpdate(
    privileged ? { _id: id } : { _id: id, userId: actor.userId },
    { status: "read", readAt: new Date() },
    { new: true },
  );

  if (!updated) {
    throw new NotFoundError("Message");
  }

  res.json({ message: "Message marked as read", data: toMessageDto(updated) });
};

export const searchMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new UnauthorizedError("Authentication required");
  }

  const q = (req.query.q as string) || "";
  const limit = Number(req.query.limit || 50);
  const channel = req.query.channel as string | undefined;

  const filter: Record<string, unknown> = {
    userId: req.user.userId,
    content: { $regex: q, $options: "i" },
  };
  if (channel) filter.channel = channel;

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ data: Array.isArray(messages) ? messages.map(toMessageDto) : [] });
};
