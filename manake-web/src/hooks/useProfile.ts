import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService, UserProfile } from "../services/profileService";

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileService.getProfile(userId!),
    enabled: !!userId,
  });
};

export const useUserActivity = (userId: string | undefined, limit = 10) => {
  return useQuery({
    queryKey: ["userActivity", userId, limit],
    queryFn: () => profileService.getUserActivity(userId!, limit),
    enabled: !!userId,
  });
};

export const useUserStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: () => profileService.getUserStats(userId!),
    enabled: !!userId,
  });
};

export const useMutualConnections = (userId: string | undefined, limit = 5) => {
  return useQuery({
    queryKey: ["mutualConnections", userId, limit],
    queryFn: () => profileService.getMutualConnections(userId!, limit),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) =>
      profileService.updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", data._id], data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
