import React, { useState } from "react";
import { useGroupFeed, useCreateGroupPost } from "../../hooks/useGroups";
import { GroupPost } from "../../services/groupService";
import { useAuth } from "../../hooks/useAuth";

interface GroupFeedProps {
  groupId: string;
  isMember: boolean;
}

export const GroupFeed: React.FC<GroupFeedProps> = ({ groupId, isMember }) => {
  const { user } = useAuth();
  const {
    data,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGroupFeed(groupId);
  const createPost = useCreateGroupPost();

  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createPost.mutateAsync({ groupId, content: content.trim() });
    setContent("");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-label="Loading feed">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center" role="alert">
        <p className="text-red-600 mb-2">Failed to load feed</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="space-y-4">
      {/* Create post form */}
      {isMember && user && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <img
              src={user.avatar || "/images/default-avatar.png"}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with the group..."
              rows={3}
              className="flex-1 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Write a post"
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!content.trim() || createPost.isPending}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      {/* Posts */}
      {allPosts.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        allPosts.map((post) => <GroupPostCard key={post._id} post={post} />)
      )}

      {hasNextPage && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

const GroupPostCard: React.FC<{ post: GroupPost }> = ({ post }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <article className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={post.author.avatar || "/images/default-avatar.png"}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-gray-900">{post.author.name}</p>
          <time className="text-sm text-gray-500" dateTime={post.createdAt}>
            {formatDate(post.createdAt)}
          </time>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt=""
          className="mt-3 rounded-lg max-h-96 object-cover"
        />
      )}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {post.likes?.length || 0} likes
        </span>
      </div>
    </article>
  );
};
