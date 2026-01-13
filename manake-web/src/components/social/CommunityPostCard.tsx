import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Card, CardBody } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { CommunityPost, postService } from "../../services/postService";

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <CommunityPostCardView
      post={post}
      isLoggedIn={user.isLoggedIn}
      onToggleLike={async (postId) => postService.toggleLike(postId)}
      onOpen={() => navigate(`/social/post/${post._id}`)}
    />
  );
}

export function CommunityPostCardView({
  post,
  isLoggedIn,
  onToggleLike,
  onOpen,
}: {
  post: CommunityPost;
  isLoggedIn: boolean;
  onToggleLike: (postId: string) => Promise<{ likesCount: number; isLiked: boolean }>;
  onOpen?: () => void;
}) {

  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const authorName = post.author?.name || "Community";

  const likesCount = useMemo(() => {
    const base = Array.isArray(post.likes) ? post.likes.length : 0;
    return optimisticLikesCount ?? base;
  }, [post.likes, optimisticLikesCount]);

  const isLiked = optimisticLiked ?? false;

  const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls : [];
  const firstImage = post.mediaType === "image" ? mediaUrls[0] : undefined;

  return (
    <Card
      variant="outlined"
      hoverable={Boolean(onOpen)}
      onClick={onOpen}
      aria-label={onOpen ? `View post by ${authorName}` : undefined}
    >
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={post.author?.avatar} name={authorName} size="md" />
            <div>
              <div className="text-sm font-semibold text-semantic-text">{authorName}</div>
              <div className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>

        {firstImage ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-semantic-border">
            <img src={firstImage} alt="" className="w-full h-56 object-cover" loading="lazy" />
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-600">{likesCount} likes</div>

          <Button
            variant={isLiked ? "primary" : "secondary"}
            size="sm"
            isLoading={isMutating}
            aria-label={isLiked ? "Unlike this post" : "Like this post"}
            aria-pressed={isLiked}
            onClick={async () => {
              setError(null);

              if (!isLoggedIn) {
                setError("Please log in to like posts.");
                return;
              }

              if (isMutating) return;

              const nextLiked = !isLiked;
              const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));

              setIsMutating(true);
              setOptimisticLiked(nextLiked);
              setOptimisticLikesCount(nextCount);

              try {
                const result = await onToggleLike(post._id);
                setOptimisticLiked(result.isLiked);
                setOptimisticLikesCount(result.likesCount);
              } catch (e) {
                setOptimisticLiked(null);
                setOptimisticLikesCount(null);
                setError((e as Error).message || "Failed to update like");
              } finally {
                setIsMutating(false);
              }
            }}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={16} />
            Like
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
