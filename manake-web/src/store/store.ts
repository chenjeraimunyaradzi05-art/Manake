import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ImpactStats } from "../types";

type StorageLike = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

const memoryStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (name: string) => (name in store ? store[name] : null),
    setItem: (name: string, value: string) => {
      store[name] = value;
    },
    removeItem: (name: string) => {
      delete store[name];
    },
  } satisfies StorageLike;
})();

function getSafeStorage(): StorageLike {
  try {
    if (typeof window === "undefined") return memoryStorage;
    const s = window.localStorage;
    // Probe in case storage exists but is blocked (can throw).
    const probeKey = "__manake_storage_probe__";
    s.setItem(probeKey, "1");
    s.removeItem(probeKey);
    return s;
  } catch {
    return memoryStorage;
  }
}

interface AppState {
  // User
  user: {
    isLoggedIn: boolean;
    _id: string | null;
    name: string | null;
    email: string | null;
    avatar: string | null;
    role: string | null;
  };
  setUser: (user: {
    _id?: string;
    name: string;
    email: string | null;
    avatar?: string | null;
    role?: string | null;
  }) => void;
  logout: () => void;

  // Saved stories
  savedStories: string[];
  saveStory: (storyId: string) => void;
  unsaveStory: (storyId: string) => void;
  isStorySaved: (storyId: string) => boolean;

  // Liked stories
  likedStories: string[];
  likeStory: (storyId: string) => void;
  unlikeStory: (storyId: string) => void;
  isStoryLiked: (storyId: string) => boolean;

  // Impact stats
  stats: ImpactStats;
  setStats: (stats: ImpactStats) => void;

  // UI state
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;

  // Newsletter
  hasSubscribedNewsletter: boolean;
  setNewsletterSubscribed: () => void;

  // Donation
  lastDonationAmount: number | null;
  setLastDonation: (amount: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: {
        isLoggedIn: false,
        _id: null,
        name: null,
        email: null,
        avatar: null,
        role: null,
      },
      setUser: (userData) =>
        set({
          user: {
            isLoggedIn: true,
            _id: userData._id ?? null,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar ?? null,
            role: userData.role ?? null,
          },
        }),
      logout: () =>
        set({
          user: {
            isLoggedIn: false,
            _id: null,
            name: null,
            email: null,
            avatar: null,
            role: null,
          },
        }),

      // Saved stories
      savedStories: [],
      saveStory: (storyId) =>
        set((state) => ({
          savedStories: [...state.savedStories, storyId],
        })),
      unsaveStory: (storyId) =>
        set((state) => ({
          savedStories: state.savedStories.filter((id) => id !== storyId),
        })),
      isStorySaved: (storyId) => get().savedStories.includes(storyId),

      // Liked stories
      likedStories: [],
      likeStory: (storyId) =>
        set((state) => ({
          likedStories: [...state.likedStories, storyId],
        })),
      unlikeStory: (storyId) =>
        set((state) => ({
          likedStories: state.likedStories.filter((id) => id !== storyId),
        })),
      isStoryLiked: (storyId) => get().likedStories.includes(storyId),

      // Impact stats (defaults)
      stats: {
        youthHelped: 500,
        successRate: 85,
        totalDonors: 1000,
        staffMembers: 25,
        programsOffered: 8,
        yearsOperating: 5,
      },
      setStats: (stats) => set({ stats }),

      // UI state
      isMenuOpen: false,
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      closeMenu: () => set({ isMenuOpen: false }),

      // Newsletter
      hasSubscribedNewsletter: false,
      setNewsletterSubscribed: () => set({ hasSubscribedNewsletter: true }),

      // Donation
      lastDonationAmount: null,
      setLastDonation: (amount) => set({ lastDonationAmount: amount }),
    }),
    {
      name: "manake-storage", // localStorage key
      storage: createJSONStorage(() => getSafeStorage()),
      partialize: (state) => ({
        savedStories: state.savedStories,
        likedStories: state.likedStories,
        hasSubscribedNewsletter: state.hasSubscribedNewsletter,
        user: state.user,
      }),
    },
  ),
);
