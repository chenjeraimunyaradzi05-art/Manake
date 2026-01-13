import api from "./api";

export type SocialPlatform = "instagram" | "facebook" | "twitter";

export interface SocialAuthor {
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "carousel";
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
  author: SocialAuthor;
  isLiked?: boolean;
  isShared?: boolean;
}

export interface SocialFeedResponse {
  posts: SocialPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function fetchSocialFeed(params?: {
  platforms?: SocialPlatform[];
  limit?: number;
  cursor?: string;
}): Promise<SocialFeedResponse> {
  const response = await api.get<SocialFeedResponse>("/social/feed", {
    params: {
      limit: params?.limit,
      cursor: params?.cursor,
      platforms: params?.platforms?.join(","),
    },
  });
  return response.data;
}

export async function likePost(platform: SocialPlatform, postId: string) {
  await api.post(`/social/${platform}/posts/${postId}/like`);
}

export async function unlikePost(platform: SocialPlatform, postId: string) {
  await api.delete(`/social/${platform}/posts/${postId}/like`);
}

export async function sharePost(platform: SocialPlatform, postId: string) {
  await api.post(`/social/${platform}/posts/${postId}/share`);
}
