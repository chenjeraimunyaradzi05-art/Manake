import api from "./api";

export interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  role?: "user" | "admin" | "moderator";
  profile?: {
    bio?: string;
    headline?: string;
    bannerImage?: string;
    location?: string;
    interests?: string[];
    skills?: string[];
  };
  mentorship?: {
    isMentor?: boolean;
    mentorshipStyle?: string;
    yearsInRecovery?: number;
    specializations?: string[];
    availability?: {
      hoursPerWeek?: number;
      preferredTimes?: string[];
    };
    averageRating?: number;
  };
  milestones?: {
    recoveryDaysCount?: number;
    lastMilestoneReached?: string;
    milestones?: Array<{ date: string; days: number; title: string }>;
  };
  privacy?: {
    visibility?: "public" | "connections-only" | "private";
    allowMessages?: "anyone" | "connections" | "none";
    allowMentorRequests?: boolean;
    showConnectionList?: boolean;
    showActivityFeed?: boolean;
  };
  isOwnProfile?: boolean;
  isPrivate?: boolean;
  isConnectionsOnly?: boolean;
  createdAt?: string;
}

export interface UserActivity {
  _id: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface UserStats {
  connections: number;
  posts: number;
}

export interface MutualConnectionsResponse {
  mutuals: Array<{
    _id: string;
    name: string;
    avatar?: string;
    profile?: { headline?: string };
  }>;
  totalCount: number;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/profiles/${userId}`);
    return response.data;
  },

  async getUserActivity(userId: string, limit = 10): Promise<UserActivity[]> {
    const response = await api.get(`/profiles/${userId}/activity`, {
      params: { limit },
    });
    return response.data;
  },

  async getUserStats(userId: string): Promise<UserStats> {
    const response = await api.get(`/profiles/${userId}/stats`);
    return response.data;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.patch("/profiles/me", updates);
    return response.data;
  },

  async getMutualConnections(
    userId: string,
    limit = 5
  ): Promise<MutualConnectionsResponse> {
    const response = await api.get(`/profiles/${userId}/mutual-connections`, {
      params: { limit },
    });
    return response.data;
  },
};
