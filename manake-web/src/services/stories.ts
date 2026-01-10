import api from "./api";
import type { Story, PaginatedResponse } from "../types";

interface FetchStoriesParams {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
  featured?: boolean;
}

// For demo purposes, return mock data when API is not available
const mockStories: Story[] = [
  {
    id: "1",
    title: "From Despair to Hope: Tendai's Journey",
    slug: "tendai-journey",
    excerpt:
      "At 19, Tendai thought his life was over. Addicted to crystal meth since 15, he had dropped out of school, lost his family's trust, and was living on the streets of Harare. Today, he's a certified electrician running his own business.",
    content: "",
    image:
      "https://images.unsplash.com/photo-1542300058-b94b8ab7411b?auto=format&fit=crop&q=80&w=600", // Smiling african man
    author: "Tendai M.",
    publishedAt: "2025-12-15",
    readTime: 5,
    likes: 234,
    comments: 45,
    tags: ["Recovery", "Employment"],
    category: "recovery",
    featured: true,
    status: "published",
  },
  {
    id: "2",
    title: "Finding Purpose Through Life Skills Training",
    slug: "life-skills-training",
    excerpt:
      "After completing the 6-month recovery program, Chipo discovered a passion for cooking during life skills training. She now runs a catering business and mentors other young women in recovery.",
    content: "",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600", // African woman portrait
    author: "Chipo N.",
    publishedAt: "2025-12-10",
    readTime: 4,
    likes: 189,
    comments: 32,
    tags: ["Life Skills", "Employment"],
    category: "education",
    featured: false,
    status: "published",
  },
  {
    id: "3",
    title: "Rebuilding Family Bonds After Addiction",
    slug: "rebuilding-family",
    excerpt:
      "Tatenda's alcoholism had torn his family apart. Through Manake's family counseling program, he learned to rebuild trust with his parents and siblings. Today, he advocates for family involvement in recovery.",
    content: "",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600", // African man portrait
    author: "Tatenda K.",
    publishedAt: "2025-12-05",
    readTime: 6,
    likes: 312,
    comments: 67,
    tags: ["Family", "Recovery"],
    category: "family",
    featured: false,
    status: "published",
  },
  {
    id: "4",
    title: "Back to School: Second Chances",
    slug: "back-to-school",
    excerpt:
      "Nyasha had to drop out of Form 4 due to drug addiction. After 8 months at Manake, she returned to school and just passed her O-Levels with flying colors. She dreams of becoming a nurse.",
    content: "",
    image:
      "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?auto=format&fit=crop&q=80&w=600", // Young african woman student
    author: "Nyasha R.",
    publishedAt: "2025-11-28",
    readTime: 5,
    likes: 456,
    comments: 89,
    tags: ["Education", "Recovery"],
    category: "education",
    featured: true,
    status: "published",
  },
  {
    id: "5",
    title: "Community Leader: Giving Back",
    slug: "community-leader",
    excerpt:
      "Three years after graduating from Manake, Farai now leads outreach programs in Mbare, helping identify at-risk youth before they fall into addiction. He's the change he wanted to see.",
    content: "",
    image:
      "https://images.unsplash.com/photo-1627434533968-07e0b57731a3?auto=format&fit=crop&q=80&w=600", // African man speaking
    author: "Farai C.",
    publishedAt: "2025-11-20",
    readTime: 7,
    likes: 278,
    comments: 56,
    tags: ["Community", "Leadership"],
    category: "community",
    featured: false,
    status: "published",
  },
  {
    id: "6",
    title: "The Power of Peer Support",
    slug: "peer-support",
    excerpt:
      "Rumbidzai credits her recovery to the peer support groups at Manake. Now she facilitates weekly sessions, helping newcomers feel understood and less alone in their journey.",
    content: "",
    image:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600", // African woman portrait
    author: "Rumbidzai T.",
    publishedAt: "2025-11-15",
    readTime: 4,
    likes: 198,
    comments: 41,
    tags: ["Peer Support", "Recovery"],
    category: "recovery",
    featured: false,
    status: "published",
  },
];

export const fetchStories = async (
  params: FetchStoriesParams = {},
): Promise<Story[]> => {
  try {
    const response = await api.get<PaginatedResponse<Story>>("/stories", {
      params,
    });
    return response.data.data;
  } catch (error) {
    console.warn("Using mock stories data");

    // Filter mock data based on params
    let filtered = [...mockStories];

    if (params.category && params.category !== "all") {
      filtered = filtered.filter((s) => s.category === params.category);
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.excerpt.toLowerCase().includes(search) ||
          s.tags.some((t) => t.toLowerCase().includes(search)),
      );
    }

    if (params.featured) {
      filtered = filtered.filter((s) => s.featured);
    }

    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }
};

export const fetchStoryById = async (id: string): Promise<Story | null> => {
  try {
    const response = await api.get<Story>(`/stories/${id}`);
    return response.data;
  } catch (error) {
    console.warn("Using mock story data");
    return mockStories.find((s) => s.id === id) || null;
  }
};

export const fetchStoryBySlug = async (slug: string): Promise<Story | null> => {
  try {
    const response = await api.get<Story>(`/stories/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.warn("Using mock story data");
    return mockStories.find((s) => s.slug === slug) || null;
  }
};

export const likeStory = async (
  storyId: string,
): Promise<{ likes: number }> => {
  try {
    const response = await api.post<{ likes: number }>(
      `/stories/${storyId}/like`,
    );
    return response.data;
  } catch (error) {
    console.warn("Like action failed");
    throw error;
  }
};

interface Comment {
  _id?: string;
  author: string;
  content: string;
  createdAt: string;
}

export const fetchComments = async (storyId: string): Promise<Comment[]> => {
  try {
    const response = await api.get<{ data: Comment[]; count: number }>(
      `/stories/${storyId}/comments`,
    );
    return response.data.data;
  } catch (error) {
    console.warn("Failed to fetch comments");
    return [];
  }
};

export const addComment = async (
  storyId: string,
  comment: { author: string; content: string },
): Promise<Comment | null> => {
  try {
    const response = await api.post<{ message: string; comment: Comment }>(
      `/stories/${storyId}/comments`,
      comment,
    );
    return response.data.comment;
  } catch (error) {
    console.warn("Failed to add comment");
    throw error;
  }
};

export const fetchFeaturedStory = async (): Promise<Story | null> => {
  const stories = await fetchStories({ featured: true, limit: 1 });
  return stories[0] || null;
};
