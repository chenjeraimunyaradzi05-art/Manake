import { Request, Response } from "express";
import { Connection, ConnectionType } from "../models/Connection";
import { User } from "../models/User";
import { BadRequestError, NotFoundError } from "../errors";

// Get all connections for the logged-in user
export const getConnections = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const connections = await Connection.find({
    $or: [{ userId }, { connectedUserId: userId }],
    status: "accepted",
  })
    .populate("userId", "name avatar")
    .populate("connectedUserId", "name avatar")
    .lean();

  res.json(connections);
};

// Get pending connection requests for the logged-in user
export const getConnectionRequests = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const requests = await Connection.find({
    connectedUserId: userId,
    status: "pending",
  })
    .populate("userId", "name avatar profile.headline")
    .lean();

  res.json(requests);
};

// Send a connection request
export const sendConnectionRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { targetUserId } = req.params;
  const { connectionType, message: _message } = req.body as {
    connectionType?: ConnectionType;
    message?: string;
  };

  if (userId === targetUserId) {
    throw new BadRequestError("Cannot connect with yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new NotFoundError("User");

  const existing = await Connection.findOne({
    $or: [
      { userId, connectedUserId: targetUserId },
      { userId: targetUserId, connectedUserId: userId },
    ],
  });

  if (existing) {
    throw new BadRequestError("Connection already exists or pending");
  }

  const connection = await Connection.create({
    userId,
    connectedUserId: targetUserId,
    connectionType: connectionType || "peer",
    status: "pending",
  });

  res.status(201).json(connection);
};

// Respond to a connection request (accept/reject)
export const respondToRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { requestId } = req.params;
  const { action } = req.body as { action: "accept" | "reject" };

  if (!["accept", "reject"].includes(action)) {
    throw new BadRequestError("Invalid action");
  }

  const connection = await Connection.findOne({
    _id: requestId,
    connectedUserId: userId,
    status: "pending",
  });

  if (!connection) throw new NotFoundError("Connection request");

  connection.status = action === "accept" ? "accepted" : "rejected";
  if (action === "accept") {
    connection.acceptedAt = new Date();
  }
  await connection.save();

  res.json(connection);
};

// Remove a connection
export const removeConnection = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { connectionId } = req.params;

  const result = await Connection.deleteOne({
    _id: connectionId,
    $or: [{ userId }, { connectedUserId: userId }],
  });

  if (result.deletedCount === 0) throw new NotFoundError("Connection");
  res.json({ message: "Connection removed" });
};

// Get connection suggestions (basic: users you're not connected to)
export const getSuggestions = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 10;

  // Get existing connections
  const connections = await Connection.find({
    $or: [{ userId }, { connectedUserId: userId }],
  }).lean();

  const connectedIds = new Set<string>();
  connectedIds.add(userId);
  for (const c of connections) {
    connectedIds.add(c.userId.toString());
    connectedIds.add(c.connectedUserId.toString());
  }

  const suggestions = await User.find({
    _id: { $nin: Array.from(connectedIds) },
    isActive: true,
  })
    .select("name avatar profile.headline profile.bio")
    .limit(limit)
    .lean();

  res.json(suggestions);
};
