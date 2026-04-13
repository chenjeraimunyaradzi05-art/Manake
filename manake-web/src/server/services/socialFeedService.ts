/**
 * Social Feed Aggregation Service
 * Fetches and aggregates posts from Instagram, Facebook, and Twitter/X
 */

import { prisma } from "../config/prisma";
import { NotFoundError } from "../errors";

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

// Cached base feed data (in production, use Redis)
// Note: metrics (likes/shares/isLiked) are overlaid per-request and not cached.
const feedCache = new Map<string, { posts: SocialPost[]; cachedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type PostMetrics = {
  likedBy: Set<string>;
  sharedBy: Set<string>;
};

// In-memory fallback when Mongo isn't connected (dev mode / DB skipped)
const metricsMemory = new Map<string, PostMetrics>();

function metricKey(platform: SocialPlatform, postId: string): string {
  return `${platform}:${postId}`;
}

function isPrismaAvailable(): boolean {
  return !!prisma;
}

function stableHashInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Build a mock/demo social post for development
 */
function makeDemoPost(platform: SocialPlatform, index: number): SocialPost {
  const now = Date.now();
  const hourAgo = now - index * 1000 * 60 * 60;
  const base = stableHashInt(`${platform}:${index}`);
  return {
    id: `${platform}-demo-${index}`,
    platform,
    content: `Sample ${platform} post #${index + 1}. This is a demo post showing what a real ${platform} update would look like in Manake's aggregated social feed.`,
    mediaUrl:
      index % 2 === 0
        ? "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600"
        : undefined,
    mediaType: index % 2 === 0 ? "image" : undefined,
    thumbnailUrl:
      index % 2 === 0
        ? "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300"
        : undefined,
    permalink: `https://${platform}.com/manake/posts/${index}`,
    timestamp: new Date(hourAgo).toISOString(),
    likes: (base % 500) + 1,
    comments: (base % 50) + 1,
    shares: (base % 20) + 1,
    author: {
      name: "Manake Rehab",
      username: "manakerehab",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Manake&background=FF6B35&color=fff",
    },
  };
}

function getCacheKey(filters: SocialFeedFilters): string {
  return JSON.stringify({
    platforms: filters.platforms?.sort() ?? ["all"],
    cursor: filters.cursor ?? "start",
  });
}

async function loadMetricsForPosts(
  posts: SocialPost[],
): Promise<Map<string, PostMetrics>> {
  const map = new Map<string, PostMetrics>();
  for (const post of posts) {
    map.set(metricKey(post.platform, post.id), {
      likedBy: new Set(),
      sharedBy: new Set(),
    });
  }

  if (!posts.length) return map;

  if (!isPrismaAvailable()) {
    for (const post of posts) {
      const key = metricKey(post.platform, post.id);
      const mem = metricsMemory.get(key);
      if (mem)
        map.set(key, {
          likedBy: new Set(mem.likedBy),
          sharedBy: new Set(mem.sharedBy),
        });
    }
    return map;
  }

  try {
    const platformPostIds = posts.map((p) => `${p.platform}:${p.id}`);
    const docs = await prisma.socialPostMetric.findMany({
      where: {
        OR: posts.map((p) => ({ platform: p.platform, postId: p.id })),
      },
    });
    for (const doc of docs) {
      const key = metricKey(doc.platform as SocialPlatform, doc.postId);
      map.set(key, {
        likedBy: new Set(doc.likedBy),
        sharedBy: new Set(doc.sharedBy),
      });
    }
    void platformPostIds;
  } catch {
    // DB unavailable — return empty metrics
  }

  return map;
}

async function overlayMetrics(
  posts: SocialPost[],
  userId?: string,
): Promise<Array<SocialPost & { isLiked?: boolean; isShared?: boolean }>> {
  const metricsByKey = await loadMetricsForPosts(posts);
  return posts.map((post) => {
    const key = metricKey(post.platform, post.id);
    const m = metricsByKey.get(key);
    const likedByCount = m?.likedBy.size ?? 0;
    const sharedByCount = m?.sharedBy.size ?? 0;
    const isLiked = userId ? Boolean(m?.likedBy.has(userId)) : undefined;
    const isShared = userId ? Boolean(m?.sharedBy.has(userId)) : undefined;

    return {
      ...post,
      likes: (post.likes ?? 0) + likedByCount,
      shares: (post.shares ?? 0) + sharedByCount,
      ...(isLiked !== undefined ? { isLiked } : {}),
      ...(isShared !== undefined ? { isShared } : {}),
    };
  });
}

function applyCursor(posts: SocialPost[], cursor?: string): SocialPost[] {
  if (!cursor) return posts;
  const cursorTime = Date.parse(cursor);
  if (Number.isNaN(cursorTime)) return posts;
  return posts.filter((p) => Date.parse(p.timestamp) < cursorTime);
}

/**
 * Fetch aggregated social feed
 */
export async function getSocialFeed(
  filters: SocialFeedFilters = {},
  userId?: string,
): Promise<SocialFeedResponse> {
  const limit = filters.limit ?? 20;
  const platforms: SocialPlatform[] = filters.platforms?.length
    ? filters.platforms
    : ["instagram", "facebook", "twitter"];

  const cacheKey = getCacheKey(filters);
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    const basePosts = applyCursor(cached.posts, filters.cursor);
    const page = basePosts.slice(0, limit);
    const posts = await overlayMetrics(page, userId);
    return {
      posts,
      nextCursor: posts.length ? posts[posts.length - 1].timestamp : undefined,
      hasMore: basePosts.length > limit,
    };
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
  posts.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  feedCache.set(cacheKey, { posts, cachedAt: Date.now() });

  const basePosts = applyCursor(posts, filters.cursor);
  const page = basePosts.slice(0, limit);
  const pageWithMetrics = await overlayMetrics(page, userId);

  return {
    posts: pageWithMetrics,
    nextCursor: pageWithMetrics.length
      ? pageWithMetrics[pageWithMetrics.length - 1].timestamp
      : undefined,
    hasMore: basePosts.length > limit,
  };
}

/**
 * Fetch Instagram-only feed
 */
export async function getInstagramFeed(
  limit = 20,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cursor?: string,
): Promise<SocialFeedResponse> {
  return getSocialFeed({ platforms: ["instagram"], limit });
}

/**
 * Fetch Facebook-only feed
 */
export async function getFacebookFeed(
  limit = 20,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cursor?: string,
): Promise<SocialFeedResponse> {
  return getSocialFeed({ platforms: ["facebook"], limit });
}

/**
 * Fetch Twitter-only feed
 */
export async function getTwitterFeed(
  limit = 20,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cursor?: string,
): Promise<SocialFeedResponse> {
  return getSocialFeed({ platforms: ["twitter"], limit });
}

/**
 * Fetch single post details (from cached demo feed)
 */
export async function getSocialPost(
  postId: string,
  platform: SocialPlatform,
  userId?: string,
): Promise<SocialPost & { isLiked?: boolean; isShared?: boolean }> {
  const feed = await getSocialFeed(
    { platforms: [platform], limit: 100 },
    userId,
  );
  const found = feed.posts.find((p) => p.id === postId);
  if (!found) throw new NotFoundError("Social post");
  return found;
}

/**
 * Like a post (persists locally; in production can also call platform APIs)
 */
export async function likeSocialPost(
  postId: string,
  platform: SocialPlatform,
  userId: string,
): Promise<void> {
  const key = metricKey(platform, postId);
  const existing = metricsMemory.get(key) ?? {
    likedBy: new Set<string>(),
    sharedBy: new Set<string>(),
  };
  existing.likedBy.add(userId);
  metricsMemory.set(key, existing);

  try {
    const row = await prisma.socialPostMetric.findUnique({
      where: { platform_postId: { platform, postId } },
    });
    const likedBy = Array.from(new Set([...(row?.likedBy ?? []), userId]));
    await prisma.socialPostMetric.upsert({
      where: { platform_postId: { platform, postId } },
      update: { likedBy },
      create: { platform, postId, likedBy, sharedBy: row?.sharedBy ?? [] },
    });
  } catch {
    /* DB unavailable */
  }
}

/**
 * Unlike a post
 */
export async function unlikeSocialPost(
  postId: string,
  platform: SocialPlatform,
  userId: string,
): Promise<void> {
  const key = metricKey(platform, postId);
  const existing = metricsMemory.get(key);
  if (existing) existing.likedBy.delete(userId);

  try {
    const row = await prisma.socialPostMetric.findUnique({
      where: { platform_postId: { platform, postId } },
    });
    if (row) {
      await prisma.socialPostMetric.update({
        where: { platform_postId: { platform, postId } },
        data: { likedBy: row.likedBy.filter((id) => id !== userId) },
      });
    }
  } catch {
    /* DB unavailable */
  }
}

/**
 * Share/repost a post
 */
export async function shareSocialPost(
  postId: string,
  platform: SocialPlatform,
  userId: string,
): Promise<void> {
  const key = metricKey(platform, postId);
  const existing = metricsMemory.get(key) ?? {
    likedBy: new Set<string>(),
    sharedBy: new Set<string>(),
  };
  existing.sharedBy.add(userId);
  metricsMemory.set(key, existing);

  try {
    const row = await prisma.socialPostMetric.findUnique({
      where: { platform_postId: { platform, postId } },
    });
    const sharedBy = Array.from(new Set([...(row?.sharedBy ?? []), userId]));
    await prisma.socialPostMetric.upsert({
      where: { platform_postId: { platform, postId } },
      update: { sharedBy },
      create: { platform, postId, likedBy: row?.likedBy ?? [], sharedBy },
    });
  } catch {
    /* DB unavailable */
  }
}

export default {
  getSocialFeed,
  getInstagramFeed,
  getFacebookFeed,
  getTwitterFeed,
  getSocialPost,
  likeSocialPost,
  unlikeSocialPost,
  shareSocialPost,
};
