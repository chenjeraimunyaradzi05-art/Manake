/**
 * Social Feed Service
 * Fetches and aggregates content from Instagram, Facebook, and Twitter/X
 */

import { Platform } from 'react-native';
import { getAuthToken } from './api';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? Platform.select({
      ios: 'http://localhost:3001/api',
      android: 'http://10.0.2.2:3001/api',
      default: 'http://localhost:3001/api'
    })
  : 'https://manake.netlify.app/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter';
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'carousel';
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
  author: {
    name: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface SocialFeedResponse {
  posts: SocialPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface SocialFeedFilters {
  platforms?: ('instagram' | 'facebook' | 'twitter')[];
  limit?: number;
  cursor?: string;
}

/**
 * Fetch aggregated social feed from all connected platforms
 */
export async function getSocialFeed(filters: SocialFeedFilters = {}): Promise<SocialFeedResponse> {
  const params = new URLSearchParams();
  
  if (filters.platforms?.length) {
    params.append('platforms', filters.platforms.join(','));
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters.cursor) {
    params.append('cursor', filters.cursor);
  }

  return fetchApi<SocialFeedResponse>(`/social/feed?${params.toString()}`);
}

/**
 * Fetch Instagram feed
 */
export async function getInstagramFeed(limit = 20, cursor?: string): Promise<SocialFeedResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append('cursor', cursor);

  return fetchApi<SocialFeedResponse>(`/social/instagram/feed?${params.toString()}`);
}

/**
 * Fetch Facebook feed
 */
export async function getFacebookFeed(limit = 20, cursor?: string): Promise<SocialFeedResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append('cursor', cursor);

  return fetchApi<SocialFeedResponse>(`/social/facebook/feed?${params.toString()}`);
}

/**
 * Fetch Twitter/X feed
 */
export async function getTwitterFeed(limit = 20, cursor?: string): Promise<SocialFeedResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append('cursor', cursor);

  return fetchApi<SocialFeedResponse>(`/social/twitter/feed?${params.toString()}`);
}

/**
 * Like a social post
 */
export async function likeSocialPost(postId: string, platform: SocialPost['platform']): Promise<void> {
  await fetchApi(`/social/${platform}/posts/${postId}/like`, { method: 'POST' });
}

/**
 * Unlike a social post
 */
export async function unlikeSocialPost(postId: string, platform: SocialPost['platform']): Promise<void> {
  await fetchApi(`/social/${platform}/posts/${postId}/like`, { method: 'DELETE' });
}

/**
 * Share/repost a social post
 */
export async function shareSocialPost(postId: string, platform: SocialPost['platform']): Promise<void> {
  await fetchApi(`/social/${platform}/posts/${postId}/share`, { method: 'POST' });
}

/**
 * Get single post details
 */
export async function getSocialPost(postId: string, platform: SocialPost['platform']): Promise<SocialPost> {
  return fetchApi<SocialPost>(`/social/${platform}/posts/${postId}`);
}

export default {
  getSocialFeed,
  getInstagramFeed,
  getFacebookFeed,
  getTwitterFeed,
  likeSocialPost,
  unlikeSocialPost,
  shareSocialPost,
  getSocialPost,
};
