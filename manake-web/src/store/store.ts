import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ImpactStats } from "../types";

interface AppState {
  // User
  user: {
    isLoggedIn: boolean;
    name: string | null;
    email: string | null;
    avatar: string | null;
    role: string | null;
  };
  setUser: (user: {
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
        name: null,
        email: null,
        avatar: null,
        role: null,
      },
      setUser: (userData) =>
        set({
          user: {
            isLoggedIn: true,
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
      partialize: (state) => ({
        savedStories: state.savedStories,
        likedStories: state.likedStories,
        hasSubscribedNewsletter: state.hasSubscribedNewsletter,
        user: state.user,
      }),
    },
  ),
);
