/**
 * Admin Service
 * Handles admin dashboard API calls for moderation and analytics
 */

import { Platform } from "react-native";
import { getAuthToken } from "./api";

// API Configuration
const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: "http://localhost:3001/api",
      android: "http://10.0.2.2:3001/api",
      default: "http://localhost:3001/api",
    })
  : "https://manake.netlify.app/api";

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
}

// ============ Types ============

export interface DashboardStats {
  users: {
    total: number;
    newThisMonth: number;
  };
  stories: {
    total: number;
    pending: number;
  };
  donations: {
    totalAmount: number;
    totalCount: number;
    thisMonth: { amount: number; count: number };
    lastMonth: { amount: number; count: number };
  };
  messages: {
    total: number;
    unread: number;
  };
}

export interface AdminStory {
  _id: string;
  title: string;
  excerpt: string;
  author: { name: string; role: string };
  category: string;
  status: "draft" | "pending" | "published" | "rejected";
  featured: boolean;
  createdAt: string;
  publishedAt?: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============ Dashboard ============

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return fetchApi<DashboardStats>("/v1/admin/stats");
};

export const getRecentActivity = async (limit = 20) => {
  return fetchApi(`/v1/admin/activity?limit=${limit}`);
};

// ============ Story Moderation ============

export const getPendingStories = async (
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<AdminStory>> => {
  return fetchApi<PaginatedResponse<AdminStory>>(
    `/v1/admin/stories/pending?page=${page}&limit=${limit}`,
  );
};

export const approveStory = async (
  storyId: string,
): Promise<{ message: string; data: AdminStory }> => {
  return fetchApi<{ message: string; data: AdminStory }>(
    `/v1/admin/stories/${storyId}/approve`,
    {
      method: "PATCH",
    },
  );
};

export const rejectStory = async (
  storyId: string,
  reason?: string,
): Promise<{ message: string; data: AdminStory }> => {
  return fetchApi<{ message: string; data: AdminStory }>(
    `/v1/admin/stories/${storyId}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    },
  );
};

export const toggleFeatureStory = async (
  storyId: string,
  featured: boolean,
): Promise<{ message: string; data: AdminStory }> => {
  return fetchApi<{ message: string; data: AdminStory }>(
    `/v1/admin/stories/${storyId}/feature`,
    {
      method: "PATCH",
      body: JSON.stringify({ featured }),
    },
  );
};

export const deleteStory = async (
  storyId: string,
): Promise<{ message: string }> => {
  return fetchApi<{ message: string }>(`/v1/admin/stories/${storyId}`, {
    method: "DELETE",
  });
};

// ============ User Management ============

export const getUsers = async (
  page = 1,
  limit = 20,
  options?: { role?: string; search?: string },
): Promise<PaginatedResponse<AdminUser>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options?.role) params.append("role", options.role);
  if (options?.search) params.append("search", options.search);

  return fetchApi<PaginatedResponse<AdminUser>>(`/v1/admin/users?${params}`);
};

export const getUserById = async (
  userId: string,
): Promise<{ data: AdminUser }> => {
  return fetchApi<{ data: AdminUser }>(`/v1/admin/users/${userId}`);
};

export const updateUserRole = async (
  userId: string,
  role: "user" | "admin" | "moderator",
): Promise<{ message: string; data: AdminUser }> => {
  return fetchApi<{ message: string; data: AdminUser }>(
    `/v1/admin/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );
};

export const toggleUserActive = async (
  userId: string,
): Promise<{ message: string; data: { id: string; isActive: boolean } }> => {
  return fetchApi<{ message: string; data: { id: string; isActive: boolean } }>(
    `/v1/admin/users/${userId}/toggle-active`,
    {
      method: "PATCH",
    },
  );
};

export const deleteUser = async (
  userId: string,
): Promise<{ message: string }> => {
  return fetchApi<{ message: string }>(`/v1/admin/users/${userId}`, {
    method: "DELETE",
  });
};
