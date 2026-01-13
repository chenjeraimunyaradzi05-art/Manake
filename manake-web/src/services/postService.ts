import api from "./api";

export type CommunityMediaType = "image" | "video" | "none";

export interface CommunityAuthor {
  _id?: string;
  name?: string;
  avatar?: string;
}

export interface CommunityPost {
  _id: string;
  author: CommunityAuthor;
  content: string;
  mediaUrls: string[];
  mediaType: CommunityMediaType;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityFeedResponse {
  data: CommunityPost[];
  nextCursor: string | null;
}

export const postService = {
  getFeed: async (params?: { limit?: number; cursor?: string }) => {
    const response = await api.get<CommunityFeedResponse>("/community/feed", {
      params: {
        limit: params?.limit,
        cursor: params?.cursor,
      },
    });
    return response.data;
  },

  getPost: async (postId: string) => {
    const response = await api.get<CommunityPost>(`/community/feed/${postId}`);
    return response.data;
  },

  createPost: async (input: {
    content: string;
    mediaUrls?: string[];
    mediaType?: CommunityMediaType;
  }) => {
    const response = await api.post<CommunityPost>("/community/feed", {
      content: input.content,
      mediaUrls: input.mediaUrls ?? [],
      mediaType: input.mediaType ?? "none",
    });
    return response.data;
  },

  toggleLike: async (postId: string) => {
    const response = await api.post<{ likesCount: number; isLiked: boolean }>(
      `/community/feed/${postId}/like`,
    );
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await api.delete<{ message: string }>(
      `/community/feed/${postId}`,
    );
    return response.data;
  },
};
