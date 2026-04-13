import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError, NotFoundError, UnauthorizedError } from "../errors";
import { sendUnifiedMessage } from "../services/messagingService";

const isPrivilegedRole = (role: unknown): boolean =>
  role === "admin" || role === "moderator";

const toMessageDto = (message: unknown): unknown => message;

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

  const message = await prisma.message.create({
    data: {
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
    },
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

  if (!allowGlobal && !targetUserId) {
    throw new UnauthorizedError("Authentication required");
  }

  const skip = (page - 1) * limit;
  const where = {
    ...(status ? { status } : {}),
    ...(channel ? { channel } : {}),
    ...(!allowGlobal && targetUserId ? { userId: targetUserId } : {}),
  };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.message.count({ where }),
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
  const message = await prisma.message.findUnique({ where: { id } });

  if (!message) throw new NotFoundError("Message");

  res.json({
    data: toMessageDto(message as unknown as Record<string, unknown>),
  });
};

export const updateMessageStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { status, failureReason } = req.body;

  const exists = await prisma.message.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Message");

  const message = await prisma.message.update({
    where: { id },
    data: {
      status,
      failureReason,
      failedAt: status === "failed" ? new Date() : undefined,
      deliveredAt: status === "delivered" ? new Date() : undefined,
      readAt: status === "read" ? new Date() : undefined,
    },
  });

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
  const exists = await prisma.message.findUnique({ where: { id } });
  if (!exists) throw new ApiError("Message not found", 404, "NOT_FOUND");
  await prisma.message.delete({ where: { id } });

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

  const where = privileged ? { id } : { id, userId: actor.userId };
  const exists = await prisma.message.findFirst({ where });
  if (!exists) throw new NotFoundError("Message");

  const updated = await prisma.message.update({
    where: { id },
    data: { status: "read", readAt: new Date() },
  });

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

  const messages = await prisma.message.findMany({
    where: {
      userId: req.user.userId,
      content: { contains: q, mode: "insensitive" },
      ...(channel ? { channel } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  res.json({ data: Array.isArray(messages) ? messages.map(toMessageDto) : [] });
};
