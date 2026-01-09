/**
 * Sync Manager
 * Handles background synchronization of offline data
 */

import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { getAuthToken } from './api';
import offlineStorage, { PendingSync } from './offlineStorage';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? Platform.select({
      ios: 'http://localhost:3001/api',
      android: 'http://10.0.2.2:3001/api',
      default: 'http://localhost:3001/api'
    })
  : 'https://manake.netlify.app/api';

async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<unknown> {
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

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes

type SyncListener = (status: SyncStatus) => void;

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  lastError: string | null;
}

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private lastSyncAt: Date | null = null;
  private lastError: string | null = null;

  /**
   * Start automatic sync monitoring
   */
  start(): void {
    // Initial sync on start
    this.syncAll();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, SYNC_INTERVAL);

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('Network restored, triggering sync...');
        this.syncAll();
      }
    });
  }

  /**
   * Stop automatic sync
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Immediately notify of current status
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      pendingCount: 0, // Will be updated during sync
      lastSyncAt: this.lastSyncAt,
      lastError: this.lastError,
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Sync all pending operations
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('No network connection, skipping sync');
      return { success: 0, failed: 0 };
    }

    // Prevent concurrent syncs
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notifyListeners();

    const queue = await offlineStorage.getSyncQueue();
    let success = 0;
    let failed = 0;

    console.log(`Starting sync of ${queue.length} operations...`);

    for (const operation of queue) {
      try {
        await this.processOperation(operation);
        await offlineStorage.removeFromSyncQueue(operation.id);
        success++;
      } catch (error) {
        console.error(`Sync failed for ${operation.id}:`, error);
        
        if (operation.retryCount >= MAX_RETRIES) {
          // Max retries reached, remove from queue
          console.log(`Max retries reached for ${operation.id}, removing`);
          await offlineStorage.removeFromSyncQueue(operation.id);
          failed++;
        } else {
          // Increment retry count
          await offlineStorage.incrementSyncRetry(operation.id);
          failed++;
        }
        
        this.lastError = error instanceof Error ? error.message : 'Sync failed';
      }
    }

    this.isSyncing = false;
    this.lastSyncAt = new Date();
    this.notifyListeners();

    console.log(`Sync complete: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Process a single sync operation
   */
  private async processOperation(operation: PendingSync): Promise<void> {
    const { method, endpoint, payload } = operation;

    await fetchApi(endpoint, {
      method,
      body: payload ? JSON.stringify(payload) : undefined,
    });
  }

  /**
   * Queue an operation for sync
   */
  async queueOperation(
    type: 'create' | 'update' | 'delete',
    endpoint: string,
    method: PendingSync['method'],
    payload: unknown
  ): Promise<string> {
    const id = await offlineStorage.addToSyncQueue({
      type,
      endpoint,
      method,
      payload,
    });

    // Try immediate sync if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      this.syncAll();
    }

    return id;
  }

  /**
   * Force sync now
   */
  async forceSync(): Promise<{ success: number; failed: number }> {
    return this.syncAll();
  }

  /**
   * Get pending sync count
   */
  async getPendingCount(): Promise<number> {
    return offlineStorage.getSyncQueueCount();
  }

  /**
   * Clear all pending syncs
   */
  async clearPending(): Promise<void> {
    await offlineStorage.clearSyncQueue();
    this.notifyListeners();
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

export default syncManager;
