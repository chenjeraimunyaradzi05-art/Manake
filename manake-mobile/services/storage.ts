import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Keys for secure storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: "manake_auth_token",
  USER_DATA: "manake_user_data",
  PREFERENCES: "manake_preferences",
  ONBOARDING_COMPLETE: "manake_onboarding_complete",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Secure Storage Service
 * Uses expo-secure-store for native platforms and falls back to in-memory storage for web
 */
class SecureStorageService {
  private webStorage: Map<string, string> = new Map();

  /**
   * Store a value securely
   */
  async setItem(key: StorageKey, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Web fallback - use localStorage (less secure but functional)
        this.webStorage.set(key, value);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, value);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value from secure storage
   */
  async getItem(key: StorageKey): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Web fallback
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem(key);
        }
        return this.webStorage.get(key) || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a value from secure storage
   */
  async deleteItem(key: StorageKey): Promise<void> {
    try {
      if (Platform.OS === "web") {
        this.webStorage.delete(key);
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Failed to delete ${key}:`, error);
      throw error;
    }
  }

  /**
   * Store an object as JSON
   */
  async setObject<T>(key: StorageKey, value: T): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.setItem(key, jsonValue);
  }

  /**
   * Retrieve and parse a JSON object
   */
  async getObject<T>(key: StorageKey): Promise<T | null> {
    const jsonValue = await this.getItem(key);
    if (!jsonValue) return null;
    try {
      return JSON.parse(jsonValue) as T;
    } catch {
      if (process.env.NODE_ENV !== "test") {
        console.error(`Failed to parse ${key} as JSON`);
      }
      return null;
    }
  }

  /**
   * Clear all stored data (useful for logout)
   */
  async clearAll(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map((key) => this.deleteItem(key)));
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();

export default secureStorage;
