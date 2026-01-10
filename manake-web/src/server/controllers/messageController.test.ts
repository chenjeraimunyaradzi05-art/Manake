import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import {
  createMessage,
  listMessages,
  getMessage,
  updateMessageStatus,
  deleteMessage,
  sendMessage,
  markMessageRead,
  searchMessages,
} from "./messageController";
import { NotFoundError } from "../errors";
import { Message } from "../models/Message";

vi.mock("../services/messagingService", () => ({
  sendUnifiedMessage: vi.fn(async () => [
    { channel: "inapp", success: true, messageId: "inapp-123" },
  ]),
}));

const mockMessage = {
  id: "msg1",
  channel: "inapp",
  direction: "inbound",
  status: "pending",
};

vi.mock("../models/Message", () => ({
  Message: {
    create: vi.fn(async () => mockMessage),
    find: vi.fn(() => ({
      sort: () => ({
        skip: () => ({
          limit: () => [mockMessage],
        }),
        limit: () => [mockMessage],
      }),
    })),
    countDocuments: vi.fn(async () => 1),
    findById: vi.fn(async () => mockMessage),
    findByIdAndUpdate: vi.fn(async () => ({ ...mockMessage, status: "sent" })),
    findByIdAndDelete: vi.fn(async () => mockMessage),
    findOneAndUpdate: vi.fn(async () => ({
      ...mockMessage,
      status: "read",
      readAt: new Date(),
    })),
  },
}));

const makeRes = (): Response => {
  const res: Partial<Response> = {};
  res.statusCode = 200;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res as Response;
  }) as Response["status"];
  res.json = vi.fn((payload: unknown) => {
    (res as Response & { body: unknown }).body = payload;
    return res as Response;
  }) as Response["json"];
  return res as Response;
};

const makeReq = (override: Partial<Request>): Request => {
  return {
    body: {},
    params: {},
    query: {},
    ...override,
  } as Request;
};

describe("messageController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a message", async () => {
    const req = makeReq({
      body: {
        channel: "inapp",
        direction: "inbound",
        content: "Hello",
        contentType: "text",
      },
    });
    const res = makeRes();

    await createMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = (res as Response & { body: unknown }).body as {
      data: { id: string };
    };
    expect(payload.data.id).toBe("msg1");
  });

  it("lists messages with pagination", async () => {
    const req = makeReq({
      query: { page: "1", limit: "10" },
      user: { userId: "user1", email: "u@example.com", role: "user" },
    });
    const res = makeRes();

    await listMessages(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Array),
        pagination: expect.objectContaining({ page: 1, limit: 10 }),
      }),
    );
  });

  it("gets a message by id", async () => {
    const req = makeReq({ params: { id: "msg1" } });
    const res = makeRes();

    await getMessage(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: mockMessage });
  });

  it("updates message status", async () => {
    const req = makeReq({ params: { id: "msg1" }, body: { status: "sent" } });
    const res = makeRes();

    await updateMessageStatus(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it("throws when updating missing message", async () => {
    const mockedMessage = Message as unknown as {
      findByIdAndUpdate: { mockResolvedValueOnce: (value: unknown) => unknown };
    };
    mockedMessage.findByIdAndUpdate.mockResolvedValueOnce(null);

    const req = makeReq({
      params: { id: "missing" },
      body: { status: "sent" },
    });
    const res = makeRes();

    await expect(updateMessageStatus(req, res)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("deletes a message", async () => {
    const req = makeReq({ params: { id: "msg1" } });
    const res = makeRes();

    await deleteMessage(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Message deleted" });
  });

  it("sends a message via unified messaging service", async () => {
    const req = makeReq({
      user: { userId: "user1", email: "u@example.com", role: "user" },
      body: { channels: ["inapp"], message: "Hi" },
    });
    const res = makeRes();

    await sendMessage(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ results: expect.any(Array) }),
    );
  });

  it("marks a message as read", async () => {
    const req = makeReq({
      user: { userId: "user1", email: "u@example.com", role: "user" },
      params: { id: "msg1" },
    });
    const res = makeRes();

    await markMessageRead(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Message marked as read" }),
    );
  });

  it("searches messages for authenticated user", async () => {
    const req = makeReq({
      user: { userId: "user1", email: "u@example.com", role: "user" },
      query: { q: "hello", limit: "10" },
    });
    const res = makeRes();

    await searchMessages(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) }),
    );
  });
});
