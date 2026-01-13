// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { CommunityPostCardView } from "../CommunityPostCard";
import type { CommunityPost } from "../../../services/postService";

afterEach(() => cleanup());

describe("CommunityPostCard", () => {
  const post: CommunityPost = {
    _id: "p1",
    author: { name: "Alice", avatar: undefined },
    content: "Hi there",
    mediaUrls: [],
    mediaType: "none",
    likes: [],
    commentsCount: 0,
    sharesCount: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    updatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  };

  it("shows login error when liking while logged out", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn(async () => ({ likesCount: 1, isLiked: true }));

    render(
      <CommunityPostCardView
        post={post}
        isLoggedIn={false}
        onToggleLike={onToggle}
      />,
    );

    await user.click(screen.getByRole("button", { name: /like/i }));

    expect(screen.getByText(/please log in to like posts/i)).toBeInTheDocument();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("calls toggleLike when logged in", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn(async () => ({ likesCount: 1, isLiked: true }));

    render(
      <CommunityPostCardView post={post} isLoggedIn onToggleLike={onToggle} />,
    );

    await user.click(screen.getByRole("button", { name: /like/i }));
    expect(onToggle).toHaveBeenCalledWith("p1");
  });
});
