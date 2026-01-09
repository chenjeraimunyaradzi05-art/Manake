/**
 * Admin Service Tests
 */

import { getDashboardStats, getPendingStories, approveStory, rejectStory, getUsers, deleteUser } from '../admin';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock getAuthToken
jest.mock('../api', () => ({
  getAuthToken: () => 'mock-admin-token',
}));

describe('Admin Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics', async () => {
      const mockStats = {
        users: { total: 100, newThisMonth: 10 },
        stories: { total: 50, pending: 5 },
        donations: { totalAmount: 5000, totalCount: 25 },
        messages: { total: 200, unread: 15 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const stats = await getDashboardStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-admin-token',
          }),
        })
      );
      expect(stats).toEqual(mockStats);
    });
  });

  describe('getPendingStories', () => {
    it('should fetch pending stories with pagination', async () => {
      const mockResponse = {
        data: [{ _id: '1', title: 'Test Story', status: 'pending' }],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getPendingStories(1, 20);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/stories/pending'),
        expect.any(Object)
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('approveStory', () => {
    it('should approve a story', async () => {
      const mockResponse = {
        message: 'Story approved',
        data: { _id: '123', status: 'published' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await approveStory('123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/stories/123/approve'),
        expect.objectContaining({ method: 'PATCH' })
      );
      expect(result.message).toBe('Story approved');
    });
  });

  describe('rejectStory', () => {
    it('should reject a story with reason', async () => {
      const mockResponse = {
        message: 'Story rejected',
        data: { _id: '123', status: 'rejected' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await rejectStory('123', 'Content not appropriate');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/stories/123/reject'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ reason: 'Content not appropriate' }),
        })
      );
      expect(result.message).toBe('Story rejected');
    });
  });

  describe('getUsers', () => {
    it('should fetch users with filters', async () => {
      const mockResponse = {
        data: [{ _id: '1', name: 'Test User', role: 'user' }],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getUsers(1, 20, { role: 'admin', search: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/v1\/admin\/users\?.*role=admin.*search=test/),
        expect.any(Object)
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockResponse = { message: 'User deleted' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deleteUser('123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/users/123'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.message).toBe('User deleted');
    });
  });

  describe('error handling', () => {
    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      });

      await expect(getDashboardStats()).rejects.toThrow('Forbidden');
    });
  });
});
