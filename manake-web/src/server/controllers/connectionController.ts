import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { BadRequestError, NotFoundError } from "../errors";

type ConnectionType = "peer" | "mentor" | "sponsor";

// Get all connections for the logged-in user
export const getConnections = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const connections = await prisma.connection.findMany({
    where: {
      status: "accepted",
      OR: [{ userId }, { connectedUserId: userId }],
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      connectedUser: { select: { id: true, name: true, avatar: true } },
    },
  });

  res.json(connections);
};

// Get pending connection requests for the logged-in user
export const getConnectionRequests = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const requests = await prisma.connection.findMany({
    where: { connectedUserId: userId, status: "pending" },
    include: {
      user: { select: { id: true, name: true, avatar: true, headline: true } },
    },
  });

  res.json(requests);
};

// Send a connection request
export const sendConnectionRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const targetUserId = req.params.targetUserId as string;
  const { connectionType } = req.body as {
    connectionType?: ConnectionType;
    message?: string;
  };

  if (userId === targetUserId) {
    throw new BadRequestError("Cannot connect with yourself");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) throw new NotFoundError("User");

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { userId, connectedUserId: targetUserId },
        { userId: targetUserId, connectedUserId: userId },
      ],
    },
  });

  if (existing) {
    throw new BadRequestError("Connection already exists or pending");
  }

  const connection = await prisma.connection.create({
    data: {
      userId,
      connectedUserId: targetUserId,
      connectionType: connectionType || "peer",
      status: "pending",
    },
  });

  res.status(201).json(connection);
};

// Respond to a connection request (accept/reject)
export const respondToRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const requestId = req.params.requestId as string;
  const { action } = req.body as { action: "accept" | "reject" };

  if (!["accept", "reject"].includes(action)) {
    throw new BadRequestError("Invalid action");
  }

  const connection = await prisma.connection.findFirst({
    where: { id: requestId, connectedUserId: userId, status: "pending" },
  });

  if (!connection) throw new NotFoundError("Connection request");

  const updated = await prisma.connection.update({
    where: { id: requestId },
    data: {
      status: action === "accept" ? "accepted" : "rejected",
      ...(action === "accept" ? { acceptedAt: new Date() } : {}),
    },
  });

  res.json(updated);
};

// Remove a connection
export const removeConnection = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const connectionId = req.params.connectionId as string;

  const result = await prisma.connection.deleteMany({
    where: {
      id: connectionId,
      OR: [{ userId }, { connectedUserId: userId }],
    },
  });

  if (result.count === 0) throw new NotFoundError("Connection");
  res.json({ message: "Connection removed" });
};

// Get connection suggestions (basic: users you're not connected to)
export const getSuggestions = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 10;

  const connections = await prisma.connection.findMany({
    where: { OR: [{ userId }, { connectedUserId: userId }] },
    select: { userId: true, connectedUserId: true },
  });

  const connectedIds = new Set<string>([userId]);
  for (const c of connections) {
    connectedIds.add(c.userId);
    connectedIds.add(c.connectedUserId);
  }

  const suggestions = await prisma.user.findMany({
    where: { id: { notIn: Array.from(connectedIds) }, isActive: true },
    select: { id: true, name: true, avatar: true, headline: true, bio: true },
    take: limit,
  });

  res.json(suggestions);
};
