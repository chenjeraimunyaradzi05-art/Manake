import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import {
  listConnectedAccounts,
  disconnectAccount,
} from "./socialAccountsController";
import { NotFoundError, UnauthorizedError } from "../errors";

vi.mock("../models/SocialAccount", () => ({
  SocialAccount: {
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

const createMockRes = (): Response => {
  const res: Partial<Response> = {};
  res.statusCode = 200;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res as Response;
  }) as unknown as Response["status"];
  res.json = vi.fn((payload: unknown) => {
    (res as Response & { body: unknown }).body = payload;
    return res as Response;
  }) as unknown as Response["json"];
  return res as Response;
};

const createMockReq = (overrides: Partial<Request>): Request => {
  return {
    user: { userId: "user-1", email: "u@example.com", role: "user" },
    params: {},
    ...overrides,
  } as Request;
};

describe("socialAccountsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires auth to list accounts", async () => {
    const req = createMockReq({ user: undefined });
    const res = createMockRes();

    await expect(listConnectedAccounts(req, res)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("lists connected accounts", async () => {
    const { SocialAccount } = await import("../models/SocialAccount");

    (SocialAccount.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn(async () => [
        {
          platform: "google",
          platformUserId: "g-1",
          displayName: "User",
          isActive: true,
        },
      ]),
    });

    const req = createMockReq({});
    const res = createMockRes();

    await listConnectedAccounts(req, res);

    const body = (res as Response & { body: any }).body;
    expect(Array.isArray(body.accounts)).toBe(true);
    expect(body.accounts[0].platform).toBe("google");
  });

  it("disconnect returns 404 if not found", async () => {
    const { SocialAccount } = await import("../models/SocialAccount");
    (SocialAccount.findOneAndUpdate as any).mockResolvedValueOnce(null);

    const req = createMockReq({
      params: { platform: "google", platformUserId: "missing" },
    });
    const res = createMockRes();

    await expect(disconnectAccount(req, res)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
