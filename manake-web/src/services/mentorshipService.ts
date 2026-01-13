import api from "./api";

export interface MentorAvailability {
  hoursPerWeek?: number;
  preferredTimes?: string[];
}

export interface Mentor {
  _id: string;
  name: string;
  avatar?: string;
  profile?: {
    headline?: string;
    location?: string;
    bio?: string;
  };
  mentorship?: {
    isMentor: boolean;
    mentorshipStyle?: string;
    yearsInRecovery?: number;
    specializations?: string[];
    availability?: MentorAvailability;
    averageRating?: number;
  };
}

export interface MentorshipMeeting {
  _id: string;
  date: string;
  duration?: number;
  notes?: string;
  rating?: number;
}

export interface Mentorship {
  _id: string;
  mentor: Mentor;
  mentee: {
    _id: string;
    name: string;
    avatar?: string;
    profile?: {
      headline?: string;
    };
  };
  status: "pending" | "active" | "completed";
  goals: string[];
  startDate?: string;
  endDate?: string;
  meetings: MentorshipMeeting[];
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorReview {
  _id: string;
  mentee: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  review?: string;
  endDate: string;
}

export interface MentorshipStats {
  isMentor: boolean;
  asMentor: {
    pending: number;
    active: number;
    completed: number;
  };
  asMentee: {
    pending: number;
    active: number;
    completed: number;
  };
  pendingRequests: number;
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
  availability?: number;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Get mentors with filters
export const getMentors = async (filters: MentorFilters = {}): Promise<MentorsResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });
  const response = await api.get(`/mentorship/mentors?${params}`);
  return response.data;
};

// Get featured mentors
export const getFeaturedMentors = async (): Promise<{ mentors: Mentor[] }> => {
  const response = await api.get("/mentorship/mentors/featured");
  return response.data;
};

// Get mentor details
export const getMentor = async (
  id: string
): Promise<{
  mentor: Mentor;
  reviews: MentorReview[];
  activeMenteeCount: number;
}> => {
  const response = await api.get(`/mentorship/mentors/${id}`);
  return response.data;
};

// Request mentorship
export const requestMentorship = async (data: {
  mentorId: string;
  goals?: string[];
  message?: string;
}): Promise<{ mentorship: Mentorship; message: string }> => {
  const response = await api.post("/mentorship/request", data);
  return response.data;
};

// Get my mentorships
export const getMyMentorships = async (params?: {
  role?: "mentor" | "mentee";
  status?: "pending" | "active" | "completed" | "all";
}): Promise<{ mentorships: Mentorship[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append("role", params.role);
  if (params?.status) queryParams.append("status", params.status);
  const response = await api.get(`/mentorship/my?${queryParams}`);
  return response.data;
};

// Get mentorship stats
export const getMentorshipStats = async (): Promise<{ stats: MentorshipStats }> => {
  const response = await api.get("/mentorship/stats");
  return response.data;
};

// Get pending requests (for mentors)
export const getPendingRequests = async (): Promise<{ requests: Mentorship[] }> => {
  const response = await api.get("/mentorship/requests");
  return response.data;
};

// Accept mentorship
export const acceptMentorship = async (
  id: string
): Promise<{ mentorship: Mentorship; message: string }> => {
  const response = await api.post(`/mentorship/${id}/accept`);
  return response.data;
};

// Decline mentorship
export const declineMentorship = async (id: string): Promise<{ message: string }> => {
  const response = await api.post(`/mentorship/${id}/decline`);
  return response.data;
};

// End mentorship
export const endMentorship = async (
  id: string,
  data?: { rating?: number; review?: string }
): Promise<{ mentorship: Mentorship; message: string }> => {
  const response = await api.post(`/mentorship/${id}/end`, data);
  return response.data;
};

// Add meeting
export const addMeeting = async (
  id: string,
  data: { date: string; duration?: number; notes?: string }
): Promise<{ mentorship: Mentorship; message: string }> => {
  const response = await api.post(`/mentorship/${id}/meetings`, data);
  return response.data;
};

// Rate meeting
export const rateMeeting = async (
  id: string,
  meetingId: string,
  rating: number
): Promise<{ mentorship: Mentorship; message: string }> => {
  const response = await api.post(`/mentorship/${id}/meetings/${meetingId}/rate`, { rating });
  return response.data;
};

// Become a mentor
export const becomeMentor = async (data: {
  mentorshipStyle: string;
  yearsInRecovery: number;
  specializations: string[];
  availability: MentorAvailability;
  bio?: string;
}): Promise<{ user: Mentor; message: string }> => {
  const response = await api.post("/mentorship/become-mentor", data);
  return response.data;
};

// Update mentor settings
export const updateMentorSettings = async (data: {
  mentorshipStyle?: string;
  specializations?: string[];
  availability?: MentorAvailability;
  allowMentorRequests?: boolean;
}): Promise<{ user: Mentor; message: string }> => {
  const response = await api.put("/mentorship/settings", data);
  return response.data;
};

export default {
  getMentors,
  getFeaturedMentors,
  getMentor,
  requestMentorship,
  getMyMentorships,
  getMentorshipStats,
  getPendingRequests,
  acceptMentorship,
  declineMentorship,
  endMentorship,
  addMeeting,
  rateMeeting,
  becomeMentor,
  updateMentorSettings,
};
