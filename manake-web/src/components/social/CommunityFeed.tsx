import { AlertCircle } from "lucide-react";
import { Button, Skeleton } from "../ui";
import { usePosts } from "../../hooks/usePosts";
import { CreateCommunityPostForm } from "./CreateCommunityPostForm";
import { CommunityPostCard } from "./CommunityPostCard";
import { MOCK_COMMUNITY_POSTS } from "../../data/mockSocial";
import { CommunityPost } from "../../services/postService";

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-semantic-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        </div>
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-10/12" />
      </div>
      <div className="rounded-xl border border-semantic-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        </div>
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-9/12" />
      </div>
    </div>
  );
}

export function CommunityFeed() {
  const query = usePosts({ limit: 20 });

  let posts = query.data?.pages.flatMap((p) => p.data) ?? [];

  // Fallback to mock data if no posts found or error occurs (for demo purposes)
  if (posts.length === 0 || query.isError) {
    posts = MOCK_COMMUNITY_POSTS as unknown as CommunityPost[];
  }

  return (
    <div className="space-y-6">
      <CreateCommunityPostForm />

      {query.isLoading ? (
        <FeedSkeleton />
      ) : (
        <div className="space-y-4">
          {query.isError && (
            <div
              className="flex gap-3 text-orange-700 bg-orange-50 p-3 rounded-lg text-sm mb-4 border border-orange-100"
              role="alert"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>
                Viewing offline preview content. Some features may be
                unavailable.
              </p>
            </div>
          )}

          {posts.map((post) => (
            <CommunityPostCard key={post._id} post={post} />
          ))}

          {posts.length === 0 && !query.isError && (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-gray-300 bg-white">
              <p className="text-lg font-semibold text-gray-800">
                No posts yet
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Be the first to share an update with the community.
              </p>
            </div>
          )}
        </div>
      )}

      {!query.isError && posts.length > 0 && query.hasNextPage && (
        <nav
          className="flex items-center justify-center pt-4"
          aria-label="Feed navigation"
        >
          <Button
            variant="secondary"
            disabled={!query.hasNextPage}
            isLoading={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
            aria-label="Load more posts"
          >
            Load more
          </Button>
        </nav>
      )}
    </div>
  );
}
