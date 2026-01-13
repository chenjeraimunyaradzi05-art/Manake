import { useEffect, useCallback, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { secureStorage, STORAGE_KEYS } from "../services/storage";
import { setAuthToken } from "../services/api";

/**
 * Hook to manage authentication state and session restoration
 * Handles secure token storage and automatic session recovery on app launch
 */
export function useAuth() {
  const [isRestoring, setIsRestoring] = useState(true);
  const store = useAuthStore();

  /**
   * Restore session from secure storage on app launch
   */
  const restoreSession = useCallback(async () => {
    try {
      // Token is now stored in SecureStore by the API service.
      // We still attempt to load the user; if token exists it will be used.
      await store.loadUser();
    } catch (error) {
      // Clear any invalid stored data
      await setAuthToken(null);
      await secureStorage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
    } finally {
      setIsRestoring(false);
    }
  }, [store]);

  /**
   * Login and persist token
   */
  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      await store.login(credentials);

      // Persist the token after successful login
      const { token } = useAuthStore.getState();
      if (token) {
        await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      }
    },
    [store],
  );

  /**
   * Register and persist token
   */
  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      phone?: string;
    }) => {
      await store.register(data);

      // Persist the token after successful registration
      const { token } = useAuthStore.getState();
      if (token) {
        await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      }
    },
    [store],
  );

  /**
   * Logout and clear persisted data
   */
  const logout = useCallback(async () => {
    await store.logout();
    await secureStorage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
    await secureStorage.deleteItem(STORAGE_KEYS.USER_DATA);
  }, [store]);

  /**
   * Social login and persist token
   */
  const socialLogin = useCallback(
    async (provider: "google" | "apple", payload: Record<string, unknown>) => {
      await store.socialLogin(provider, payload);

      const { token } = useAuthStore.getState();
      if (token) {
        await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      }
    },
    [store],
  );

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading || isRestoring,
    isRestoring,
    error: store.error,

    // Actions
    login,
    register,
    socialLogin,
    logout,
    updateProfile: store.updateProfile,
    clearError: store.clearError,
    setDemoMode: store.setDemoMode,
  };
}

export default useAuth;
