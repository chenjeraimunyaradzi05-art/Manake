/**
 * Admin Controller Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDashboardStats,
  getPendingStories,
  getUsers,
  approveStory,
  deleteUser,
} from "../adminController";
import { Request, Response } from "express";

// Mock models
vi.mock("../../models/Story", () => ({
  Story: {
    countDocuments: vi.fn().mockResolvedValue(50),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi
        .fn()
        .mockResolvedValue([
          { _id: "1", title: "Test Story", status: "pending" },
        ]),
    }),
    findByIdAndUpdate: vi
      .fn()
      .mockResolvedValue({ _id: "1", title: "Test", status: "published" }),
    aggregate: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../models/User", () => ({
  User: {
    countDocuments: vi.fn().mockResolvedValue(100),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([]),
    }),
    findById: vi.fn().mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue({
          _id: "1",
          name: "Test User",
          email: "test@test.com",
        }),
    }),
    findByIdAndDelete: vi
      .fn()
      .mockResolvedValue({ _id: "1", name: "Deleted User" }),
  },
}));

vi.mock("../../models/Donation", () => ({
  Donation: {
    aggregate: vi.fn().mockResolvedValue([{ total: 10000, count: 5 }]),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([]),
    }),
  },
}));

vi.mock("../../models/Message", () => ({
  Message: {
    countDocuments: vi.fn().mockResolvedValue(25),
  },
}));

describe("Admin Controller", () => {
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDashboardStats", () => {
    it("should return aggregated dashboard statistics", async () => {
      const req = {} as Request;
      const res = mockRes();

      await getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          users: expect.objectContaining({
            total: expect.any(Number),
          }),
          stories: expect.objectContaining({
            total: expect.any(Number),
          }),
          donations: expect.objectContaining({
            totalAmount: expect.any(Number),
          }),
          messages: expect.objectContaining({
            total: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe("getPendingStories", () => {
    it("should return paginated pending stories", async () => {
      const req = { query: { page: "1", limit: "10" } } as unknown as Request;
      const res = mockRes();

      await getPendingStories(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
          }),
        }),
      );
    });
  });

  describe("getUsers", () => {
    it("should return paginated users list", async () => {
      const req = { query: { page: "1", limit: "20" } } as unknown as Request;
      const res = mockRes();

      await getUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 20,
          }),
        }),
      );
    });

    it("should support search filter", async () => {
      const req = {
        query: { search: "john", page: "1" },
      } as unknown as Request;
      const res = mockRes();

      await getUsers(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("approveStory", () => {
    it("should approve a pending story", async () => {
      const req = { params: { id: "123" } } as unknown as Request;
      const res = mockRes();

      await approveStory(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Story approved",
          data: expect.any(Object),
        }),
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      const req = {
        params: { id: "123" },
        user: { userId: "different-id", role: "admin" },
      } as unknown as Request;
      const res = mockRes();

      await deleteUser(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User deleted",
        }),
      );
    });

    it("should prevent self-deletion", async () => {
      const req = {
        params: { id: "123" },
        user: { userId: "123", role: "admin" },
      } as unknown as Request;
      const res = mockRes();

      await expect(deleteUser(req, res)).rejects.toThrow(
        "Cannot delete your own account",
      );
    });
  });
});
