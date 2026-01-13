import api from "./api";

export interface GroupMember {
  _id: string;
  name: string;
  avatar?: string;
  profile?: { headline?: string };
  role: "admin" | "moderator" | "member";
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  isPrivate: boolean;
  memberCount: number;
  isMember?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  admins?: GroupMember[];
  moderators?: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupPost {
  _id: string;
  author: { _id: string; name: string; avatar?: string };
  content: string;
  mediaUrl?: string;
  likes: string[];
  createdAt: string;
}

export interface PaginatedResponse<_T = unknown> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GroupsResponse extends PaginatedResponse<Group> {
  groups: Group[];
}

export interface GroupMembersResponse extends PaginatedResponse<GroupMember> {
  members: GroupMember[];
}

export interface GroupFeedResponse extends PaginatedResponse<GroupPost> {
  posts: GroupPost[];
}

export const groupService = {
  async getGroups(params?: {
    category?: string;
    search?: string;
    my?: boolean;
    page?: number;
    limit?: number;
  }): Promise<GroupsResponse> {
    const response = await api.get("/groups", { params });
    return response.data;
  },

  async getGroup(groupId: string): Promise<Group> {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  async createGroup(data: {
    name: string;
    description?: string;
    category?: string;
    icon?: string;
    isPrivate?: boolean;
  }): Promise<Group> {
    const response = await api.post("/groups", data);
    return response.data;
  },

  async updateGroup(
    groupId: string,
    updates: Partial<Group>
  ): Promise<Group> {
    const response = await api.patch(`/groups/${groupId}`, updates);
    return response.data;
  },

  async joinGroup(groupId: string): Promise<{ message: string; memberCount: number }> {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },

  async leaveGroup(groupId: string): Promise<{ message: string }> {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  },

  async getGroupMembers(
    groupId: string,
    page = 1,
    limit = 20
  ): Promise<GroupMembersResponse> {
    const response = await api.get(`/groups/${groupId}/members`, {
      params: { page, limit },
    });
    return response.data;
  },

  async getGroupFeed(
    groupId: string,
    page = 1,
    limit = 10
  ): Promise<GroupFeedResponse> {
    const response = await api.get(`/groups/${groupId}/feed`, {
      params: { page, limit },
    });
    return response.data;
  },

  async createGroupPost(
    groupId: string,
    content: string,
    mediaUrl?: string
  ): Promise<GroupPost> {
    const response = await api.post(`/groups/${groupId}/posts`, {
      content,
      mediaUrl,
    });
    return response.data;
  },

  async deleteGroup(groupId: string): Promise<{ message: string }> {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },
};
