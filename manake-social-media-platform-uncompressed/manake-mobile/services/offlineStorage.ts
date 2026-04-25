/**
 * Offline Storage Service
 * Provides caching and offline data persistence using AsyncStorage
 */

// Note: Requires: npx expo install @react-native-async-storage/async-storage
// Using dynamic import for optional dependency

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface PendingSync {
  id: string;
  type: "create" | "update" | "delete";
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  payload: unknown;
  createdAt: number;
  retryCount: number;
}

const CACHE_PREFIX = "@manake_cache_";
const SYNC_QUEUE_KEY = "@manake_sync_queue";
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

// In-memory fallback when AsyncStorage is not available
const memoryStorage = new Map<string, string>();

let AsyncStorage: any = null;

async function getStorage() {
  if (!AsyncStorage) {
    try {
      const mod = await import("@react-native-async-storage/async-storage");
      AsyncStorage = mod.default;
    } catch {
      console.log("AsyncStorage not installed, using memory fallback");
    }
  }
  return AsyncStorage;
}

async function getItem(key: string): Promise<string | null> {
  const storage = await getStorage();
  if (storage) {
    return storage.getItem(key);
  }
  return memoryStorage.get(key) || null;
}

async function setItem(key: string, value: string): Promise<void> {
  const storage = await getStorage();
  if (storage) {
    await storage.setItem(key, value);
  } else {
    memoryStorage.set(key, value);
  }
}

async function removeItem(key: string): Promise<void> {
  const storage = await getStorage();
  if (storage) {
    await storage.removeItem(key);
  } else {
    memoryStorage.delete(key);
  }
}

async function getAllKeys(): Promise<string[]> {
  const storage = await getStorage();
  if (storage) {
    return storage.getAllKeys();
  }
  return Array.from(memoryStorage.keys());
}

async function multiRemove(keys: string[]): Promise<void> {
  const storage = await getStorage();
  if (storage) {
    await storage.multiRemove(keys);
  } else {
    keys.forEach((k) => memoryStorage.delete(k));
  }
}

/**
 * Store data in cache with optional TTL
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttlMs: number = DEFAULT_TTL,
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };
  await setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
}

/**
 * Get data from cache (returns null if expired or not found)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      await removeCache(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

/**
 * Get cached data with metadata
 */
export async function getCacheWithMeta<T>(
  key: string,
): Promise<CacheEntry<T> | null> {
  try {
    const raw = await getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Remove item from cache
 */
export async function removeCache(key: string): Promise<void> {
  await removeItem(`${CACHE_PREFIX}${key}`);
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
  const keys = await getAllKeys();
  const cacheKeys = keys.filter((k: string) => k.startsWith(CACHE_PREFIX));
  await multiRemove(cacheKeys);
}

/**
 * Get all cache keys
 */
export async function getCacheKeys(): Promise<string[]> {
  const keys = await getAllKeys();
  return keys
    .filter((k: string) => k.startsWith(CACHE_PREFIX))
    .map((k: string) => k.replace(CACHE_PREFIX, ""));
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  const keys = await getCacheKeys();
  let cleared = 0;

  for (const key of keys) {
    const entry = await getCacheWithMeta(key);
    if (entry && Date.now() > entry.expiresAt) {
      await removeCache(key);
      cleared++;
    }
  }

  return cleared;
}

// ============ Sync Queue ============

/**
 * Add operation to sync queue
 */
export async function addToSyncQueue(
  operation: Omit<PendingSync, "id" | "createdAt" | "retryCount">,
): Promise<string> {
  const queue = await getSyncQueue();
  const id = `sync_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const entry: PendingSync = {
    ...operation,
    id,
    createdAt: Date.now(),
    retryCount: 0,
  };

  queue.push(entry);
  await setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

  return id;
}

/**
 * Get all pending sync operations
 */
export async function getSyncQueue(): Promise<PendingSync[]> {
  try {
    const raw = await getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Remove operation from sync queue
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const queue = await getSyncQueue();
  const filtered = queue.filter((op) => op.id !== id);
  await setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
}

/**
 * Update retry count for sync operation
 */
export async function incrementSyncRetry(id: string): Promise<void> {
  const queue = await getSyncQueue();
  const updated = queue.map((op) =>
    op.id === id ? { ...op, retryCount: op.retryCount + 1 } : op,
  );
  await setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  await removeItem(SYNC_QUEUE_KEY);
}

/**
 * Get sync queue count
 */
export async function getSyncQueueCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}

// ============ Stories Cache ============

const STORIES_CACHE_KEY = "stories";
const STORIES_TTL = 1000 * 60 * 30; // 30 minutes

export async function cacheStories(stories: unknown[]): Promise<void> {
  await setCache(STORIES_CACHE_KEY, stories, STORIES_TTL);
}

export async function getCachedStories<T>(): Promise<T[] | null> {
  return getCache<T[]>(STORIES_CACHE_KEY);
}

// ============ User Data Cache ============

const USER_CACHE_KEY = "user_data";
const USER_TTL = 1000 * 60 * 60 * 24; // 24 hours

export async function cacheUserData(userData: unknown): Promise<void> {
  await setCache(USER_CACHE_KEY, userData, USER_TTL);
}

export async function getCachedUserData<T>(): Promise<T | null> {
  return getCache<T>(USER_CACHE_KEY);
}

// ============ Messages Cache ============

const MESSAGES_CACHE_KEY = "messages_";
const MESSAGES_TTL = 1000 * 60 * 15; // 15 minutes

export async function cacheMessages(
  conversationId: string,
  messages: unknown[],
): Promise<void> {
  await setCache(
    `${MESSAGES_CACHE_KEY}${conversationId}`,
    messages,
    MESSAGES_TTL,
  );
}

export async function getCachedMessages<T>(
  conversationId: string,
): Promise<T[] | null> {
  return getCache<T[]>(`${MESSAGES_CACHE_KEY}${conversationId}`);
}

export default {
  // Generic cache operations
  setCache,
  getCache,
  getCacheWithMeta,
  removeCache,
  clearAllCache,
  getCacheKeys,
  clearExpiredCache,

  // Sync queue operations
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  incrementSyncRetry,
  clearSyncQueue,
  getSyncQueueCount,

  // Specialized caches
  cacheStories,
  getCachedStories,
  cacheUserData,
  getCachedUserData,
  cacheMessages,
  getCachedMessages,
};
