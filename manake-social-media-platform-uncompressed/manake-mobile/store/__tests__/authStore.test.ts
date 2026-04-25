import { useAuthStore } from "../authStore";
import { act } from "@testing-library/react-native";

// Mock the api module
jest.mock("../../services/api", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
  setAuthToken: jest.fn(),
  mockData: {
    user: {
      id: "1",
      email: "demo@manake.org",
      name: "Demo User",
      role: "user",
      joinedAt: "2024-01-01",
      preferences: {
        notifications: true,
        emailUpdates: true,
        darkMode: false,
        language: "en",
      },
      stats: {
        storiesLiked: 0,
        commentsMade: 0,
        totalDonated: 0,
        storiesShared: 0,
      },
    },
  },
}));

// Reset store before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
});

describe("AuthStore", () => {
  const mockUser = {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    role: "user" as const,
    joinedAt: "2024-01-01",
    preferences: {
      notifications: true,
      emailUpdates: true,
      darkMode: false,
      language: "en",
    },
    stats: {
      storiesLiked: 0,
      commentsMade: 0,
      totalDonated: 0,
      storiesShared: 0,
    },
  };

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("login", () => {
    it("should set loading state during login", async () => {
      const { authApi } = require("../../services/api");

      // Setup a delayed response
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      authApi.login.mockReturnValue(loginPromise);

      // Start login
      const loginAction = useAuthStore.getState().login({
        email: "test@example.com",
        password: "password123",
      });

      // Should be loading
      expect(useAuthStore.getState().isLoading).toBe(true);

      // Resolve the login
      resolveLogin!({
        success: true,
        data: { user: mockUser, token: "test-token" },
      });

      await loginAction;

      // Should no longer be loading
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should set user and token on successful login", async () => {
      const { authApi, setAuthToken } = require("../../services/api");

      authApi.login.mockResolvedValue({
        success: true,
        data: { user: mockUser, token: "test-token" },
      });

      await useAuthStore.getState().login({
        email: "test@example.com",
        password: "password123",
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("test-token");
      expect(state.isAuthenticated).toBe(true);
      expect(setAuthToken).toHaveBeenCalledWith("test-token");
    });

    it("should set error on failed login", async () => {
      const { authApi } = require("../../services/api");

      authApi.login.mockResolvedValue({
        success: false,
        message: "Invalid credentials",
      });

      await expect(
        useAuthStore.getState().login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Invalid credentials");

      const state = useAuthStore.getState();
      expect(state.error).toBe("Invalid credentials");
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("should register user and set authenticated state", async () => {
      const { authApi, setAuthToken } = require("../../services/api");

      authApi.register.mockResolvedValue({
        success: true,
        data: { user: mockUser, token: "new-token" },
      });

      await useAuthStore.getState().register({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("new-token");
      expect(state.isAuthenticated).toBe(true);
      expect(setAuthToken).toHaveBeenCalledWith("new-token");
    });

    it("should handle registration failure", async () => {
      const { authApi } = require("../../services/api");

      authApi.register.mockResolvedValue({
        success: false,
        message: "Email already exists",
      });

      await expect(
        useAuthStore.getState().register({
          name: "Test User",
          email: "existing@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Email already exists");

      expect(useAuthStore.getState().error).toBe("Email already exists");
    });
  });

  describe("logout", () => {
    it("should clear user state on logout", async () => {
      const { authApi, setAuthToken } = require("../../services/api");

      // First set a logged in state
      useAuthStore.setState({
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
      });

      authApi.logout.mockResolvedValue({ success: true });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(setAuthToken).toHaveBeenCalledWith(null);
    });

    it("should clear state even if logout API fails", async () => {
      const { authApi } = require("../../services/api");

      useAuthStore.setState({
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
      });

      authApi.logout.mockRejectedValue(new Error("Network error"));

      await useAuthStore.getState().logout();

      // Should still clear state
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      useAuthStore.setState({ error: "Some error" });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe("setDemoMode", () => {
    it("should set demo user without API call", () => {
      useAuthStore.getState().setDemoMode();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeDefined();
      expect(state.user?.email).toBe("demo@manake.org");
    });
  });
});
