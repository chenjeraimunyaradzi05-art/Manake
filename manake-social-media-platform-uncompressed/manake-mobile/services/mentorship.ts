import { Platform } from "react-native";
import { getAuthToken } from "./api";

// API Configuration
const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: "http://localhost:3001/api",
      android: "http://10.0.2.2:3001/api",
      default: "http://localhost:3001/api",
    })
  : "https://manake.netlify.app/api";

// Types
export interface MentorAvailability {
  hoursPerWeek: number;
  preferredTimes: string[];
}

export interface Mentor {
  _id: string;
  name: string;
  avatar?: string;
  profile: {
    headline?: string;
    bio?: string;
  };
  mentorship: {
    isMentor: boolean;
    mentorshipStyle?: string;
    yearsInRecovery?: number;
    specializations: string[];
    averageRating?: number;
    availability?: MentorAvailability;
  };
}

export interface MentorshipMeeting {
  _id: string;
  date: string;
  duration: number;
  notes?: string;
  rating?: number;
}

export interface Mentorship {
  _id: string;
  mentor: Mentor;
  mentee: Mentor;
  status: "pending" | "active" | "completed" | "declined";
  goals: string[];
  startDate?: string;
  endDate?: string;
  meetings: MentorshipMeeting[];
  rating?: number;
  review?: string;
  message?: string;
  createdAt: string;
}

export interface MentorshipStats {
  totalMentees: number;
  activeMentorships: number;
  completedMentorships: number;
  averageRating: number;
  totalMeetings: number;
}

export interface MentorsResponse {
  mentors: Mentor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MentorFilters {
  specialization?: string;
  minRating?: number;
  availability?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authToken = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

// Mentor discovery
export async function getMentors(filters: MentorFilters = {}): Promise<MentorsResponse> {
  const params = new URLSearchParams();
  
  if (filters.specialization) params.append("specialization", filters.specialization);
  if (filters.minRating) params.append("minRating", String(filters.minRating));
  if (filters.availability) params.append("availability", filters.availability);
  if (filters.search) params.append("search", filters.search);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  const query = params.toString();
  return fetchApi<MentorsResponse>(`/v1/mentorship/mentors${query ? `?${query}` : ""}`);
}

export async function getFeaturedMentors(): Promise<{ mentors: Mentor[] }> {
  return fetchApi<{ mentors: Mentor[] }>("/v1/mentorship/mentors/featured");
}

export async function getMentor(id: string): Promise<{ mentor: Mentor; reviews: unknown[] }> {
  return fetchApi<{ mentor: Mentor; reviews: unknown[] }>(`/v1/mentorship/mentors/${id}`);
}

// Mentorship management
export async function requestMentorship(
  mentorId: string,
  data: { goals: string[]; message?: string }
): Promise<{ mentorship: Mentorship }> {
  return fetchApi<{ mentorship: Mentorship }>("/v1/mentorship/request", {
    method: "POST",
    body: JSON.stringify({ mentorId, ...data }),
  });
}

export async function getMyMentorships(): Promise<{ mentorships: Mentorship[] }> {
  return fetchApi<{ mentorships: Mentorship[] }>("/v1/mentorship/my");
}

export async function getMentorshipStats(): Promise<{ stats: MentorshipStats }> {
  return fetchApi<{ stats: MentorshipStats }>("/v1/mentorship/stats");
}

export async function getPendingRequests(): Promise<{ requests: Mentorship[] }> {
  return fetchApi<{ requests: Mentorship[] }>("/v1/mentorship/requests");
}

export async function acceptMentorship(id: string): Promise<{ mentorship: Mentorship }> {
  return fetchApi<{ mentorship: Mentorship }>(`/v1/mentorship/${id}/accept`, {
    method: "POST",
  });
}

export async function declineMentorship(id: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/v1/mentorship/${id}/decline`, {
    method: "POST",
  });
}

export async function endMentorship(
  id: string,
  data: { rating: number; review?: string }
): Promise<{ mentorship: Mentorship }> {
  return fetchApi<{ mentorship: Mentorship }>(`/v1/mentorship/${id}/end`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function addMeeting(
  mentorshipId: string,
  data: { date: string; duration: number; notes?: string }
): Promise<{ mentorship: Mentorship }> {
  return fetchApi<{ mentorship: Mentorship }>(`/v1/mentorship/${mentorshipId}/meetings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function rateMeeting(
  mentorshipId: string,
  meetingId: string,
  rating: number
): Promise<{ mentorship: Mentorship }> {
  return fetchApi<{ mentorship: Mentorship }>(
    `/v1/mentorship/${mentorshipId}/meetings/${meetingId}/rate`,
    {
      method: "POST",
      body: JSON.stringify({ rating }),
    }
  );
}

// Become a mentor
export async function becomeMentor(data: {
  mentorshipStyle: string;
  yearsInRecovery: number;
  specializations: string[];
  availability: MentorAvailability;
}): Promise<{ user: unknown }> {
  return fetchApi<{ user: unknown }>("/v1/mentorship/become-mentor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMentorSettings(data: {
  mentorshipStyle?: string;
  specializations?: string[];
  availability?: MentorAvailability;
}): Promise<{ user: unknown }> {
  return fetchApi<{ user: unknown }>("/v1/mentorship/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
