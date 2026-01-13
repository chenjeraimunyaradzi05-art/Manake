import { AlertCircle } from "lucide-react";
import { Button, Skeleton } from "../ui";
import { usePosts } from "../../hooks/usePosts";
import { CreateCommunityPostForm } from "./CreateCommunityPostForm";
import { CommunityPostCard } from "./CommunityPostCard";

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-semantic-border bg-white p-5">
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
      <div className="rounded-xl border border-semantic-border bg-white p-5">
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

  const posts = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-6">
      <CreateCommunityPostForm />

      {query.isLoading ? (
        <FeedSkeleton />
      ) : query.isError ? (
        <div className="flex gap-3 text-red-700 bg-red-50 p-4 rounded-xl" role="alert">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm">
              {(query.error as Error)?.message || "Failed to load community feed"}
            </p>
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-gray-300 bg-white">
          <p className="text-lg font-semibold text-gray-800">No posts yet</p>
          <p className="mt-1 text-sm text-gray-600">Be the first to share an update with the community.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <CommunityPostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <nav className="flex items-center justify-between" aria-label="Feed navigation">
        <Button
          variant="secondary"
          size="sm"
          isLoading={query.isFetching && !query.isLoading}
          onClick={() => query.refetch()}
          aria-label="Refresh the feed"
        >
          Refresh
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={!query.hasNextPage}
          isLoading={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
          aria-label="Load more posts"
        >
          Load more
        </Button>
      </nav>
    </div>
  );
}
