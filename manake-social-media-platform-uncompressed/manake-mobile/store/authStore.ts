import { create } from "zustand";
import type { User, AuthState, LoginCredentials, RegisterData } from "../types";
import { authApi, setAuthToken, mockData } from "../services/api";

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  socialLogin: (
    provider: "google" | "apple",
    payload: Record<string, unknown>,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setDemoMode: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        await setAuthToken(response.data.token);
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      if (response.success) {
        await setAuthToken(response.data.token);
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  socialLogin: async (
    provider: "google" | "apple",
    payload: Record<string, unknown>,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response =
        provider === "google"
          ? await authApi.socialLoginGoogle(payload as any)
          : await authApi.socialLoginApple(payload as any);

      if (response.success) {
        await setAuthToken((response as any).data.token);
        set({
          user: (response as any).data.user,
          token: (response as any).data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Social login failed");
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Social login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API call fails
    } finally {
      await setAuthToken(null);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    const { token } = get();
    if (!token) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authApi.getProfile();
      if (response.success) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error("Failed to load user");
      }
    } catch {
      // Token might be invalid, clear auth state
      await setAuthToken(null);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = get();

      // Demo mode (or offline/dev without backend) should still allow local profile edits.
      if (token === "demo-token" && user) {
        set({
          user: {
            ...user,
            ...data,
            preferences: data.preferences ?? user.preferences,
            stats: data.stats ?? user.stats,
          },
          isLoading: false,
        });
        return;
      }

      const response = await authApi.updateProfile(data);
      if (response.success) {
        set({
          user: response.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      const { user } = get();
      if (user) {
        // Fall back to local merge if the backend isn't reachable.
        set({
          user: {
            ...user,
            ...data,
            preferences: data.preferences ?? user.preferences,
            stats: data.stats ?? user.stats,
          },
        });
      }
      set({
        error:
          error instanceof Error ? error.message : "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // Demo mode for development/testing
  setDemoMode: () => {
    set({
      user: mockData.user,
      token: "demo-token",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },
}));

export default useAuthStore;
