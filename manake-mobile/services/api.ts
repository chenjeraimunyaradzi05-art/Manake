import { Platform } from "react-native";
import type {
  Story,
  StoryComment,
  User,
  Donation,
  DonationRequest,
  ContactMessage,
  ApiResponse,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
} from "../types";

// API Configuration
const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: "http://localhost:3001/api",
      android: "http://10.0.2.2:3001/api", // Android emulator localhost
      default: "http://localhost:3001/api",
    })
  : "https://manake.netlify.app/api";

// Token storage (using a simple in-memory store, can be replaced with SecureStore)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed");
  }
}

function toApiResponse<T>(value: unknown): ApiResponse<T> {
  if (
    value &&
    typeof value === "object" &&
    "success" in value &&
    "data" in value
  ) {
    return value as ApiResponse<T>;
  }
  return { success: true, data: value as T };
}

function toPaginatedResponse<T>(value: unknown): PaginatedResponse<T> {
  if (
    value &&
    typeof value === "object" &&
    "success" in value &&
    "data" in value &&
    "pagination" in value
  ) {
    return value as PaginatedResponse<T>;
  }

  // Legacy server shape: { data: T[], pagination: { page, limit, total, pages } }
  const legacy = value as {
    data?: T[];
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      pages?: number;
    };
  };

  return {
    success: true,
    data: legacy?.data ?? [],
    pagination: {
      page: legacy?.pagination?.page ?? 1,
      limit: legacy?.pagination?.limit ?? 20,
      total: legacy?.pagination?.total ?? legacy?.data?.length ?? 0,
      totalPages: legacy?.pagination?.pages ?? 1,
    },
  };
}

function normalizeStoryComment(storyId: string, raw: any): StoryComment {
  return {
    id: raw?._id || raw?.id,
    storyId,
    author: String(raw?.author || ""),
    authorImage: raw?.authorImage || undefined,
    content: String(raw?.content || ""),
    createdAt: raw?.createdAt
      ? String(raw.createdAt)
      : new Date().toISOString(),
    approved: raw?.approved ?? true,
  };
}

function normalizeStory(raw: any): Story {
  const authorName = raw?.author?.name ?? raw?.author ?? "Manake";
  const authorImage = raw?.author?.image ?? raw?.authorImage;
  const createdAt =
    raw?.publishedAt ?? raw?.date ?? raw?.createdAt ?? new Date().toISOString();
  const updatedAt = raw?.updatedAt;

  const content: string = String(raw?.content || "");
  const wordCount =
    content.trim().length > 0 ? content.trim().split(/\s+/).length : 0;
  const readTime = raw?.readTime ?? Math.max(1, Math.round(wordCount / 200));

  const rawCategory = String(raw?.category || "").toLowerCase();
  const category: Story["category"] = rawCategory.includes("family")
    ? "family"
    : rawCategory.includes("community")
      ? "community"
      : "recovery";

  const commentsCount = Array.isArray(raw?.comments)
    ? raw.comments.length
    : typeof raw?.comments === "number"
      ? raw.comments
      : 0;

  return {
    id: String(raw?._id || raw?.id || ""),
    title: String(raw?.title || ""),
    slug: String(raw?.slug || ""),
    excerpt: String(raw?.excerpt || ""),
    content,
    image: String(raw?.image || ""),
    author: String(authorName),
    authorImage: authorImage ? String(authorImage) : undefined,
    publishedAt: String(createdAt),
    updatedAt: updatedAt ? String(updatedAt) : undefined,
    readTime: Number(readTime) || 1,
    likes: Number(raw?.likes) || 0,
    comments: commentsCount,
    tags: Array.isArray(raw?.tags) ? raw.tags.map((t: any) => String(t)) : [],
    category,
    featured: Boolean(raw?.featured) || false,
    status: (raw?.status as any) || "published",
    isLiked: Boolean(raw?.isLiked) || false,
  };
}

function toServerCategory(category: string): string {
  const c = category.toLowerCase();
  if (c === "recovery") return "Recovery";
  if (c === "family") return "Family";
  if (c === "community") return "Community";
  return category;
}

// ============= AUTH API =============
export const authApi = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    const raw = await fetchApi<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return toApiResponse(raw);
  },

  register: async (
    data: RegisterData,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    const raw = await fetchApi<unknown>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return toApiResponse(raw);
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const raw = await fetchApi<unknown>("/auth/logout", { method: "POST" });
    return toApiResponse(raw);
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const raw = await fetchApi<unknown>("/auth/profile");
    return toApiResponse(raw);
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const raw = await fetchApi<unknown>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return toApiResponse(raw);
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const raw = await fetchApi<unknown>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return toApiResponse(raw);
  },

  socialLoginGoogle: async (payload: {
    idToken: string;
    redirectUri?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const raw = await fetchApi<unknown>("/auth/social/google", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return toApiResponse(raw);
  },

  socialLoginApple: async (payload: {
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
    clientId?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const raw = await fetchApi<unknown>("/auth/social/apple", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return toApiResponse(raw);
  },
};

// ============= STORIES API =============
export const storiesApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Story>> => {
    const raw = await fetchApi<unknown>(`/stories?page=${page}&limit=${limit}`);
    const normalized = toPaginatedResponse<any>(raw);
    return {
      ...normalized,
      data: normalized.data.map((s: any) => normalizeStory(s)),
    };
  },

  getFeatured: async (): Promise<ApiResponse<Story[]>> => {
    // Backend supports `featured=true` query param.
    const raw = await fetchApi<unknown>(
      "/stories?featured=true&page=1&limit=10",
    );
    const normalized = toPaginatedResponse<any>(raw);
    return {
      success: true,
      data: normalized.data.map((s: any) => normalizeStory(s)),
    };
  },

  getById: async (id: string): Promise<ApiResponse<Story>> => {
    const raw = await fetchApi<unknown>(`/stories/${id}`);
    const resp = toApiResponse<any>(raw);
    return { ...resp, data: normalizeStory(resp.data) };
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Story>> => {
    const raw = await fetchApi<unknown>(`/stories/slug/${slug}`);
    const resp = toApiResponse<any>(raw);
    return { ...resp, data: normalizeStory(resp.data) };
  },

  getByCategory: async (
    category: string,
    page = 1,
  ): Promise<PaginatedResponse<Story>> => {
    const serverCategory = toServerCategory(category);
    const raw = await fetchApi<unknown>(
      `/stories?category=${encodeURIComponent(serverCategory)}&page=${page}&limit=10`,
    );
    const normalized = toPaginatedResponse<any>(raw);
    return {
      ...normalized,
      data: normalized.data.map((s: any) => normalizeStory(s)),
    };
  },

  likeStory: async (id: string): Promise<ApiResponse<{ likes: number }>> => {
    const raw = await fetchApi<unknown>(`/stories/${id}/like`, {
      method: "POST",
    });
    return toApiResponse(raw);
  },

  unlikeStory: async (id: string): Promise<ApiResponse<{ likes: number }>> => {
    const raw = await fetchApi<unknown>(`/stories/${id}/unlike`, {
      method: "POST",
    });
    return toApiResponse(raw);
  },

  addComment: async (
    id: string,
    args: { author: string; content: string },
  ): Promise<ApiResponse<StoryComment>> => {
    const raw = await fetchApi<unknown>(`/stories/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(args),
    });
    // Legacy server returns { message, comment }
    if (raw && typeof raw === "object" && "comment" in raw) {
      const comment = normalizeStoryComment(id, (raw as any).comment);
      return { success: true, data: comment, message: (raw as any).message };
    }
    return toApiResponse(raw);
  },

  getComments: async (id: string): Promise<ApiResponse<StoryComment[]>> => {
    const raw = await fetchApi<unknown>(`/stories/${id}/comments`);
    // Legacy server returns { data, count }
    if (
      raw &&
      typeof raw === "object" &&
      "data" in raw &&
      !("success" in raw)
    ) {
      const items = Array.isArray((raw as any).data) ? (raw as any).data : [];
      return {
        success: true,
        data: items.map((c: any) => normalizeStoryComment(id, c)),
      };
    }
    return toApiResponse(raw);
  },
};

// ============= DONATIONS API =============
export const donationsApi = {
  create: async (
    data: DonationRequest,
  ): Promise<
    ApiResponse<{
      checkoutUrl?: string;
      reference: string;
      instructions?: string;
      paymentMethod?: string;
    }>
  > => {
    // Backend expects amount in cents and uses /donations/create-payment-intent
    const amountCents = Math.round((data.amount || 0) * 100);
    const payload = {
      ...data,
      amount: String(amountCents),
    };

    const raw = await fetchApi<unknown>("/donations/create-payment-intent", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return toApiResponse(raw);
  },

  getHistory: async (): Promise<ApiResponse<Donation[]>> => {
    return fetchApi("/donations/history");
  },

  getById: async (id: string): Promise<ApiResponse<Donation>> => {
    return fetchApi(`/donations/${id}`);
  },

  getStats: async (): Promise<
    ApiResponse<{ total: number; count: number; average: number }>
  > => {
    return fetchApi("/donations/stats");
  },
};

// ============= CONTACT API =============
export const contactApi = {
  send: async (message: ContactMessage): Promise<ApiResponse<null>> => {
    return fetchApi("/contact", {
      method: "POST",
      body: JSON.stringify(message),
    });
  },

  getEmergencyContacts: async (): Promise<ApiResponse<EmergencyContact[]>> => {
    return fetchApi("/contact/emergency");
  },
};

// Emergency Contact type (local since it might not be in types yet)
interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  available24h: boolean;
}

// ============= MOCK DATA FOR DEVELOPMENT =============
// These will be used when the API is not available
export const mockData = {
  user: {
    id: "1",
    email: "demo@manake.org",
    name: "Demo User",
    avatar: "https://i.pravatar.cc/150?img=1",
    phone: "+263 77 123 4567",
    bio: "Supporting recovery journeys since 2023",
    joinedAt: "2023-06-15T00:00:00Z",
    role: "user" as const,
    preferences: {
      notifications: true,
      emailUpdates: true,
      darkMode: false,
      language: "en",
    },
    stats: {
      storiesLiked: 24,
      commentsMade: 12,
      totalDonated: 150,
      storiesShared: 8,
    },
  },

  stories: [
    {
      id: "1",
      title: "From Darkness to Light: My Recovery Journey",
      slug: "from-darkness-to-light",
      excerpt: "After 10 years of struggle, I finally found hope at Manake...",
      content: "Full story content here...",
      image:
        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
      author: "James Moyo",
      authorImage: "https://i.pravatar.cc/150?img=8",
      publishedAt: "2025-12-15T00:00:00Z",
      readTime: 5,
      likes: 124,
      comments: 18,
      tags: ["recovery", "hope", "family"],
      category: "recovery" as const,
      featured: true,
      status: "published" as const,
    },
    {
      id: "2",
      title: "Rebuilding My Career After Rehab",
      slug: "rebuilding-career-after-rehab",
      excerpt: "The employment program gave me the skills I needed...",
      content: "Full story content here...",
      image:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
      author: "Sarah Ndlovu",
      authorImage: "https://i.pravatar.cc/150?img=5",
      publishedAt: "2025-12-10T00:00:00Z",
      readTime: 4,
      likes: 89,
      comments: 7,
      tags: ["employment", "skills", "success"],
      category: "employment" as const,
      featured: true,
      status: "published" as const,
    },
    {
      id: "3",
      title: "How My Family Found Healing Together",
      slug: "family-healing-together",
      excerpt:
        "Recovery is not just individual, it involves the whole family...",
      content: "Full story content here...",
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
      author: "Tendai Chirwa",
      authorImage: "https://i.pravatar.cc/150?img=3",
      publishedAt: "2025-12-05T00:00:00Z",
      readTime: 6,
      likes: 156,
      comments: 23,
      tags: ["family", "healing", "support"],
      category: "family" as const,
      featured: false,
      status: "published" as const,
    },
  ],

  emergencyContacts: [
    {
      id: "1",
      name: "Manake 24/7 Helpline",
      phone: "+263 242 123 456",
      description: "Immediate support for those in crisis",
      available24h: true,
    },
    {
      id: "2",
      name: "WhatsApp Support",
      phone: "+263 77 987 6543",
      description: "Chat with a counselor",
      available24h: true,
    },
  ],

  donationPurposes: [
    "General Fund",
    "Rehabilitation Programs",
    "Education & Training",
    "Family Support Services",
    "Emergency Assistance",
    "Building & Infrastructure",
  ],
};

export default {
  auth: authApi,
  stories: storiesApi,
  donations: donationsApi,
  contact: contactApi,
  mockData,
};
