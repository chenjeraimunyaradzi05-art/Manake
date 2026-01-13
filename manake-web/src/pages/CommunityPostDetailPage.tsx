import { Link, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { CommunityPostCardView } from "../components/social/CommunityPostCard";
import { Button, Skeleton } from "../components/ui";
import { usePost } from "../hooks/usePosts";
import { postService } from "../services/postService";
import { useAuth } from "../context/AuthContext";

export function CommunityPostDetailPage() {
  const { id } = useParams();
  const postId = id ?? "";
  const { user } = useAuth();

  const query = usePost(postId);

  return (
    <>
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Post</h1>
              <p className="text-sm text-primary-100">View a community update.</p>
            </div>
            <Link to="/social" className="btn-secondary text-sm">
              Back
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gray-50">
        <div className="container-custom">
          {query.isLoading ? (
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
            </div>
          ) : query.isError ? (
            <div className="flex gap-3 text-red-700 bg-red-50 p-4 rounded-xl">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">
                  {(query.error as Error)?.message || "Failed to load post"}
                </p>
                <div className="mt-3">
                  <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          ) : !query.data ? (
            <p className="text-gray-700">Post not found.</p>
          ) : (
            <CommunityPostCardView
              post={query.data}
              isLoggedIn={user.isLoggedIn}
              onToggleLike={async (p) => postService.toggleLike(p)}
            />
          )}
        </div>
      </section>
    </>
  );
}
