import { useMemo, useState } from "react";
import { Button, Card, CardBody, Textarea } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { useCreatePost } from "../../hooks/usePosts";

export function CreateCommunityPostForm() {
  const { user } = useAuth();
  const createPost = useCreatePost();

  return (
    <CreateCommunityPostFormView
      isLoggedIn={user.isLoggedIn}
      isSubmitting={createPost.isPending}
      onCreatePost={async (content) => {
        await createPost.mutateAsync({ content });
      }}
    />
  );
}

export function CreateCommunityPostFormView(props: {
  isLoggedIn: boolean;
  isSubmitting: boolean;
  onCreatePost: (content: string) => Promise<void>;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = props.isLoggedIn;
  const isSubmitting = props.isSubmitting;
  const onCreatePost = props.onCreatePost;

  const canSubmit = useMemo(() => content.trim().length > 0, [content]);

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-semantic-text">Create a post</h3>
            <p className="text-xs text-gray-600">Share an update with the community.</p>
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isLoggedIn ? "What’s on your mind?" : "Log in to post."}
          disabled={!isLoggedIn || isSubmitting}
          rows={4}          aria-label="Post content"        />

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 flex items-center justify-end">
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!canSubmit}
            aria-label="Create post"
            onClick={async () => {
              setError(null);

              if (!isLoggedIn) {
                setError("Please log in to create a post.");
                return;
              }

              try {
                await onCreatePost(content.trim());
                setContent("");
              } catch (e) {
                setError((e as Error).message || "Failed to create post");
              }
            }}
          >
            Post
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
