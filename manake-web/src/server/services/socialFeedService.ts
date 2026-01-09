/**
 * Social Feed Aggregation Service
 * Fetches and aggregates posts from Instagram, Facebook, and Twitter/X
 */

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter';

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
  mediaType?: 'image' | 'video' | 'carousel';
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
  author: SocialAuthor;
}

export interface SocialFeedResponse {
  posts: SocialPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface SocialFeedFilters {
  platforms?: SocialPlatform[];
  limit?: number;
  cursor?: string;
}

// Cached feed data (in production, use Redis)
const feedCache = new Map<string, { posts: SocialPost[]; cachedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Build a mock/demo social post for development
 */
function makeDemoPost(platform: SocialPlatform, index: number): SocialPost {
  const now = Date.now();
  const hourAgo = now - index * 1000 * 60 * 60;
  return {
    id: `${platform}-demo-${index}`,
    platform,
    content: `Sample ${platform} post #${index + 1}. This is a demo post showing what a real ${platform} update would look like in Manake's aggregated social feed.`,
    mediaUrl:
      index % 2 === 0
        ? 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600'
        : undefined,
    mediaType: index % 2 === 0 ? 'image' : undefined,
    thumbnailUrl:
      index % 2 === 0
        ? 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300'
        : undefined,
    permalink: `https://${platform}.com/manake/posts/${index}`,
    timestamp: new Date(hourAgo).toISOString(),
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 50),
    shares: Math.floor(Math.random() * 20),
    author: {
      name: 'Manake Rehab',
      username: 'manakerehab',
      avatarUrl: 'https://ui-avatars.com/api/?name=Manake&background=FF6B35&color=fff',
    },
  };
}

function getCacheKey(filters: SocialFeedFilters): string {
  return JSON.stringify({
    platforms: filters.platforms?.sort() ?? ['all'],
    cursor: filters.cursor ?? 'start',
  });
}

/**
 * Fetch aggregated social feed
 */
export async function getSocialFeed(filters: SocialFeedFilters = {}): Promise<SocialFeedResponse> {
  const limit = filters.limit ?? 20;
  const platforms: SocialPlatform[] = filters.platforms?.length
    ? filters.platforms
    : ['instagram', 'facebook', 'twitter'];

  const cacheKey = getCacheKey(filters);
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { posts: cached.posts.slice(0, limit), nextCursor: undefined, hasMore: false };
  }

  // In production, call Meta Graph API / Twitter API here.
  // For now, return demo data.
  const posts: SocialPost[] = [];
  let idx = 0;
  for (const platform of platforms) {
    for (let i = 0; i < 5; i++) {
      posts.push(makeDemoPost(platform, idx++));
    }
  }

  // Sort by timestamp descending
  posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  feedCache.set(cacheKey, { posts, cachedAt: Date.now() });

  return { posts: posts.slice(0, limit), nextCursor: undefined, hasMore: posts.length > limit };
}

/**
 * Fetch Instagram-only feed
 */
export async function getInstagramFeed(
  limit = 20,
  _cursor?: string
): Promise<SocialFeedResponse> {
  return getSocialFeed({ platforms: ['instagram'], limit });
}

/**
 * Fetch Facebook-only feed
 */
export async function getFacebookFeed(limit = 20, _cursor?: string): Promise<SocialFeedResponse> {
  return getSocialFeed({ platforms: ['facebook'], limit });
}

/**
 * Fetch Twitter-only feed
 */
export async function getTwitterFeed(limit = 20, _cursor?: string): Promise<SocialFeedResponse> {
  return getSocialFeed({ platforms: ['twitter'], limit });
}

/**
 * Like a post (placeholder – would call platform API)
 */
export async function likeSocialPost(
  _postId: string,
  _platform: SocialPlatform
): Promise<void> {
  // In production, call platform API
}

/**
 * Unlike a post
 */
export async function unlikeSocialPost(
  _postId: string,
  _platform: SocialPlatform
): Promise<void> {
  // In production, call platform API
}

/**
 * Share/repost a post
 */
export async function shareSocialPost(
  _postId: string,
  _platform: SocialPlatform
): Promise<void> {
  // In production, call platform API
}

export default {
  getSocialFeed,
  getInstagramFeed,
  getFacebookFeed,
  getTwitterFeed,
  likeSocialPost,
  unlikeSocialPost,
  shareSocialPost,
};
