import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postService } from "../services/postService";

export function usePosts(options?: { limit?: number }) {
  const limit = options?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: ["communityFeed", { limit }],
    queryFn: ({ pageParam }) =>
      postService.getFeed({ limit, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.createPost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["communityFeed"] });
    },
  });
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["communityPost", postId],
    queryFn: () => postService.getPost(postId),
    enabled: Boolean(postId),
  });
}
