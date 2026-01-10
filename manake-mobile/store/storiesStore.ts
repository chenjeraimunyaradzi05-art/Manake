import { create } from "zustand";
import type { Story } from "../types";
import { storiesApi, mockData } from "../services/api";

interface StoriesState {
  stories: Story[];
  featuredStories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

interface StoriesStore extends StoriesState {
  // Actions
  fetchStories: (refresh?: boolean) => Promise<void>;
  fetchFeaturedStories: () => Promise<void>;
  fetchStoryById: (id: string) => Promise<void>;
  likeStory: (id: string) => Promise<void>;
  unlikeStory: (id: string) => Promise<void>;
  clearCurrentStory: () => void;
  clearError: () => void;
  loadMockData: () => void;
}

export const useStoriesStore = create<StoriesStore>((set, get) => ({
  // Initial state
  stories: [],
  featuredStories: [],
  currentStory: null,
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Actions
  fetchStories: async (refresh = false) => {
    const { currentPage, stories, isLoading } = get();

    if (isLoading) return;

    const page = refresh ? 1 : currentPage;
    set({ isLoading: true, error: null });

    try {
      const response = await storiesApi.getAll(page);
      if (response.success) {
        const newStories = refresh
          ? response.data
          : [...stories, ...response.data];

        set({
          stories: newStories,
          currentPage: page + 1,
          hasMore: response.pagination.page < response.pagination.totalPages,
          isLoading: false,
        });
      } else {
        throw new Error("Failed to fetch stories");
      }
    } catch (error) {
      // Use mock data as fallback in development
      if (__DEV__) {
        set({
          stories: mockData.stories,
          isLoading: false,
          hasMore: false,
        });
      } else {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch stories",
          isLoading: false,
        });
      }
    }
  },

  fetchFeaturedStories: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await storiesApi.getFeatured();
      if (response.success) {
        set({
          featuredStories: response.data,
          isLoading: false,
        });
      } else {
        throw new Error("Failed to fetch featured stories");
      }
    } catch (error) {
      // Use mock data as fallback in development
      if (__DEV__) {
        set({
          featuredStories: mockData.stories.filter((s) => s.featured),
          isLoading: false,
        });
      } else {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch featured stories",
          isLoading: false,
        });
      }
    }
  },

  fetchStoryById: async (id: string) => {
    set({ isLoading: true, error: null, currentStory: null });

    try {
      const response = await storiesApi.getById(id);
      if (response.success) {
        set({
          currentStory: response.data,
          isLoading: false,
        });
      } else {
        throw new Error("Story not found");
      }
    } catch (error) {
      // Use mock data as fallback in development
      if (__DEV__) {
        const story = mockData.stories.find((s) => s.id === id);
        if (story) {
          set({
            currentStory: story,
            isLoading: false,
          });
        } else {
          set({
            error: "Story not found",
            isLoading: false,
          });
        }
      } else {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch story",
          isLoading: false,
        });
      }
    }
  },

  likeStory: async (id: string) => {
    const { stories, currentStory, featuredStories } = get();

    try {
      await storiesApi.likeStory(id);

      // Update stories list
      set({
        stories: stories.map((s) =>
          s.id === id ? { ...s, likes: s.likes + 1, isLiked: true } : s,
        ),
        featuredStories: featuredStories.map((s) =>
          s.id === id ? { ...s, likes: s.likes + 1, isLiked: true } : s,
        ),
        currentStory:
          currentStory?.id === id
            ? { ...currentStory, likes: currentStory.likes + 1, isLiked: true }
            : currentStory,
      });
    } catch (error) {
      // Optimistically update UI even if API fails in dev mode
      if (__DEV__) {
        set({
          stories: stories.map((s) =>
            s.id === id ? { ...s, likes: s.likes + 1, isLiked: true } : s,
          ),
          currentStory:
            currentStory?.id === id
              ? {
                  ...currentStory,
                  likes: currentStory.likes + 1,
                  isLiked: true,
                }
              : currentStory,
        });
      }
    }
  },

  unlikeStory: async (id: string) => {
    const { stories, currentStory, featuredStories } = get();

    try {
      await storiesApi.unlikeStory(id);

      set({
        stories: stories.map((s) =>
          s.id === id ? { ...s, likes: s.likes - 1, isLiked: false } : s,
        ),
        featuredStories: featuredStories.map((s) =>
          s.id === id ? { ...s, likes: s.likes - 1, isLiked: false } : s,
        ),
        currentStory:
          currentStory?.id === id
            ? { ...currentStory, likes: currentStory.likes - 1, isLiked: false }
            : currentStory,
      });
    } catch (error) {
      // Optimistically update UI even if API fails in dev mode
      if (__DEV__) {
        set({
          stories: stories.map((s) =>
            s.id === id ? { ...s, likes: s.likes - 1, isLiked: false } : s,
          ),
          currentStory:
            currentStory?.id === id
              ? {
                  ...currentStory,
                  likes: currentStory.likes - 1,
                  isLiked: false,
                }
              : currentStory,
        });
      }
    }
  },

  clearCurrentStory: () => set({ currentStory: null }),

  clearError: () => set({ error: null }),

  loadMockData: () => {
    set({
      stories: mockData.stories,
      featuredStories: mockData.stories.filter((s) => s.featured),
      isLoading: false,
      hasMore: false,
    });
  },
}));

export default useStoriesStore;
