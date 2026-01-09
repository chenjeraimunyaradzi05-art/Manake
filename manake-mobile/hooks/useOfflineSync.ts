/**
 * useOfflineSync Hook
 * Provides offline-first data fetching with automatic sync
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { syncManager, SyncStatus } from '../services/syncManager';
import offlineStorage from '../services/offlineStorage';
import { useConnectivity } from './useConnectivity';

export interface UseOfflineSyncOptions<T> {
  cacheKey: string;
  fetcher: () => Promise<T>;
  ttlMs?: number;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export interface UseOfflineSyncResult<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isFromCache: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export function useOfflineSync<T>({
  cacheKey,
  fetcher,
  ttlMs,
  onError,
  enabled = true,
}: UseOfflineSyncOptions<T>): UseOfflineSyncResult<T> {
  const { isConnected } = useConnectivity();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  // Fetch data from network and update cache
  const fetchFromNetwork = useCallback(async (): Promise<T | null> => {
    try {
      const freshData = await fetcher();
      
      if (mountedRef.current) {
        setData(freshData);
        setIsFromCache(false);
        setError(null);
      }

      // Update cache
      await offlineStorage.setCache(cacheKey, freshData, ttlMs);
      
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed');
      
      if (mountedRef.current) {
        setError(error);
      }
      
      onError?.(error);
      return null;
    }
  }, [fetcher, cacheKey, ttlMs, onError]);

  // Load data from cache first, then fetch fresh if online
  const loadData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await offlineStorage.getCache<T>(cacheKey);
      
      if (cached && mountedRef.current) {
        setData(cached);
        setIsFromCache(true);
        setIsLoading(false);
      }

      // Fetch fresh data if online
      if (isConnected) {
        const freshData = await fetchFromNetwork();
        
        // If no cached data and network failed, keep loading state until done
        if (!cached && !freshData && mountedRef.current) {
          setIsLoading(false);
        }
      } else if (!cached) {
        // Offline and no cache
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setIsLoading(false);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    }
  }, [enabled, cacheKey, isConnected, fetchFromNetwork]);

  // Refresh data (pull-to-refresh)
  const refresh = useCallback(async () => {
    if (!isConnected) {
      return;
    }

    setIsRefreshing(true);
    await fetchFromNetwork();
    
    if (mountedRef.current) {
      setIsRefreshing(false);
    }
  }, [isConnected, fetchFromNetwork]);

  // Clear cache for this key
  const clearCache = useCallback(async () => {
    await offlineStorage.removeCache(cacheKey);
    setData(null);
    setIsFromCache(false);
  }, [cacheKey]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    loadData();

    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  // Refetch when coming back online
  useEffect(() => {
    if (isConnected && isFromCache && enabled) {
      fetchFromNetwork();
    }
  }, [isConnected]);

  return {
    data,
    isLoading,
    isRefreshing,
    isFromCache,
    error,
    refresh,
    clearCache,
  };
}

/**
 * Hook to monitor sync status
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    lastError: null,
  });

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setStatus);
    
    // Update pending count
    const updatePendingCount = async () => {
      const count = await syncManager.getPendingCount();
      setStatus((prev) => ({ ...prev, pendingCount: count }));
    };
    updatePendingCount();

    return unsubscribe;
  }, []);

  const forceSync = useCallback(async () => {
    return syncManager.forceSync();
  }, []);

  const clearPending = useCallback(async () => {
    return syncManager.clearPending();
  }, []);

  return {
    ...status,
    forceSync,
    clearPending,
  };
}

export default useOfflineSync;
