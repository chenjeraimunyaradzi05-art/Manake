/**
 * Redis Configuration and Cache Service
 * Provides caching layer for API responses
 * Falls back to in-memory cache when Redis is not available
 */

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * In-memory cache store (fallback when Redis unavailable)
 */
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}, 60000);

/**
 * Cache configuration
 */
interface CacheConfig {
  redisUrl?: string;
  defaultTtl: number; // seconds
  keyPrefix: string;
}

const config: CacheConfig = {
  redisUrl: process.env.REDIS_URL,
  defaultTtl: 300, // 5 minutes default
  keyPrefix: "manake:",
};

/**
 * Cache service for storing and retrieving cached data
 */
class CacheService {
  private isRedisAvailable = false;

  constructor() {
    // In a production app, you'd initialize Redis here
    // For now, we use in-memory cache
    if (config.redisUrl) {
      console.log("📦 Redis URL configured, but using in-memory cache for now");
      console.log(
        "   To enable Redis, install ioredis and uncomment the Redis code",
      );
    }
  }

  /**
   * Build a cache key with prefix
   */
  private buildKey(key: string): string {
    return `${config.keyPrefix}${key}`;
  }

  /**
   * Get an item from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);

    if (this.isRedisAvailable) {
      // Redis implementation would go here
      // const data = await redis.get(fullKey);
      // return data ? JSON.parse(data) : null;
    }

    // In-memory fallback
    const entry = memoryCache.get(fullKey) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      memoryCache.delete(fullKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Set an item in cache
   */
  async set<T>(
    key: string,
    data: T,
    ttlSeconds: number = config.defaultTtl,
  ): Promise<void> {
    const fullKey = this.buildKey(key);

    if (this.isRedisAvailable) {
      // Redis implementation would go here
      // await redis.setex(fullKey, ttlSeconds, JSON.stringify(data));
    }

    // In-memory fallback
    memoryCache.set(fullKey, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete an item from cache
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.buildKey(key);

    if (this.isRedisAvailable) {
      // await redis.del(fullKey);
    }

    memoryCache.delete(fullKey);
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const fullPattern = this.buildKey(pattern);
    let count = 0;

    if (this.isRedisAvailable) {
      // const keys = await redis.keys(fullPattern);
      // if (keys.length > 0) {
      //   count = await redis.del(...keys);
      // }
    }

    // In-memory fallback - convert pattern to regex
    const regex = new RegExp(
      fullPattern.replace(/\*/g, ".*").replace(/\?/g, "."),
    );

    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (this.isRedisAvailable) {
      // await redis.flushdb();
    }

    memoryCache.clear();
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = config.defaultTtl,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  /**
   * Get cache stats (for monitoring)
   */
  getStats(): { size: number; isRedisAvailable: boolean } {
    return {
      size: memoryCache.size,
      isRedisAvailable: this.isRedisAvailable,
    };
  }
}

// Export singleton instance
export const cache = new CacheService();

// Export for custom instances
export { CacheService };
export type { CacheConfig };

// ============================================
// Cache Key Generators
// ============================================

/**
 * Generate cache key for stories list
 */
export function storiesCacheKey(params: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
}): string {
  const parts = ["stories"];
  if (params.category) parts.push(`cat:${params.category}`);
  if (params.featured) parts.push("featured");
  if (params.search) parts.push(`q:${params.search}`);
  parts.push(`p:${params.page || 1}`);
  parts.push(`l:${params.limit || 20}`);
  return parts.join(":");
}

/**
 * Generate cache key for a single story
 */
export function storyCacheKey(id: string): string {
  return `story:${id}`;
}

/**
 * Generate cache key for story by slug
 */
export function storySlugCacheKey(slug: string): string {
  return `story:slug:${slug}`;
}

// ============================================
// Cache TTL Constants (in seconds)
// ============================================

export const CACHE_TTL = {
  STORIES_LIST: 60, // 1 minute - list changes frequently
  STORY_DETAIL: 300, // 5 minutes - individual story
  STORY_FEATURED: 120, // 2 minutes - featured stories
  DONATION_STATS: 600, // 10 minutes - donation statistics
  USER_SESSION: 900, // 15 minutes - user session data
  STATIC_CONTENT: 3600, // 1 hour - rarely changing content
} as const;
