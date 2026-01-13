import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
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
  MentorFilters,
} from "../services/mentorshipService";

// Query keys
const mentorshipKeys = {
  all: ["mentorship"] as const,
  mentors: (filters: MentorFilters = {}) => [...mentorshipKeys.all, "mentors", filters] as const,
  featuredMentors: () => [...mentorshipKeys.all, "featured"] as const,
  mentor: (id: string) => [...mentorshipKeys.all, "mentor", id] as const,
  myMentorships: (role?: string, status?: string) => [...mentorshipKeys.all, "my", role, status] as const,
  stats: () => [...mentorshipKeys.all, "stats"] as const,
  pendingRequests: () => [...mentorshipKeys.all, "pending"] as const,
};

// Get mentors with infinite scroll
export const useMentors = (filters: Omit<MentorFilters, "page"> = {}) => {
  return useInfiniteQuery({
    queryKey: mentorshipKeys.mentors(filters),
    queryFn: ({ pageParam = 1 }) => getMentors({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

// Get featured mentors
export const useFeaturedMentors = () => {
  return useQuery({
    queryKey: mentorshipKeys.featuredMentors(),
    queryFn: getFeaturedMentors,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get mentor details
export const useMentor = (id: string) => {
  return useQuery({
    queryKey: mentorshipKeys.mentor(id),
    queryFn: () => getMentor(id),
    enabled: !!id,
  });
};

// Get my mentorships
export const useMyMentorships = (role?: "mentor" | "mentee", status?: "pending" | "active" | "completed" | "all") => {
  return useQuery({
    queryKey: mentorshipKeys.myMentorships(role, status),
    queryFn: () => getMyMentorships({ role, status }),
  });
};

// Get mentorship stats
export const useMentorshipStats = () => {
  return useQuery({
    queryKey: mentorshipKeys.stats(),
    queryFn: getMentorshipStats,
  });
};

// Get pending requests
export const usePendingRequests = () => {
  return useQuery({
    queryKey: mentorshipKeys.pendingRequests(),
    queryFn: getPendingRequests,
  });
};

// Request mentorship
export const useRequestMentorship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestMentorship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.myMentorships() });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.stats() });
    },
  });
};

// Accept mentorship
export const useAcceptMentorship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptMentorship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.pendingRequests() });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.myMentorships() });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.stats() });
    },
  });
};

// Decline mentorship
export const useDeclineMentorship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineMentorship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.pendingRequests() });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.stats() });
    },
  });
};

// End mentorship
export const useEndMentorship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { rating?: number; review?: string } }) =>
      endMentorship(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.myMentorships() });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.stats() });
    },
  });
};

// Add meeting
export const useAddMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { date: string; duration?: number; notes?: string };
    }) => addMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.myMentorships() });
    },
  });
};

// Rate meeting
export const useRateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      meetingId,
      rating,
    }: {
      id: string;
      meetingId: string;
      rating: number;
    }) => rateMeeting(id, meetingId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.myMentorships() });
    },
  });
};

// Become a mentor
export const useBecomeMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: becomeMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
};

// Update mentor settings
export const useUpdateMentorSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMentorSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
};
