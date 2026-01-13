import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { groupService, Group } from "../services/groupService";

export const useGroups = (params?: {
  category?: string;
  search?: string;
  my?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: ["groups", params],
    queryFn: ({ pageParam = 1 }) =>
      groupService.getGroups({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
};

export const useMyGroups = () => {
  return useGroups({ my: true });
};

export const useGroup = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.getGroup(groupId!),
    enabled: !!groupId,
  });
};

export const useGroupMembers = (groupId: string | undefined, limit = 20) => {
  return useInfiniteQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: ({ pageParam = 1 }) =>
      groupService.getGroupMembers(groupId!, pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!groupId,
  });
};

export const useGroupFeed = (groupId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["groupFeed", groupId],
    queryFn: ({ pageParam = 1 }) =>
      groupService.getGroupFeed(groupId!, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof groupService.createGroup>[0]) =>
      groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      updates,
    }: {
      groupId: string;
      updates: Partial<Group>;
    }) => groupService.updateGroup(groupId, updates),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.joinGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.leaveGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useCreateGroupPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      content,
      mediaUrl,
    }: {
      groupId: string;
      content: string;
      mediaUrl?: string;
    }) => groupService.createGroupPost(groupId, content, mediaUrl),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["groupFeed", groupId] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};
