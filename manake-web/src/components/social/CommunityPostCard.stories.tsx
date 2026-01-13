import type { Meta, StoryObj } from "@storybook/react";
import { CommunityPostCardView } from "./CommunityPostCard";

const meta: Meta<typeof CommunityPostCardView> = {
  title: "Social/CommunityPostCard",
  component: CommunityPostCardView,
};

export default meta;
type Story = StoryObj<typeof CommunityPostCardView>;

export const Default: Story = {
  args: {
    isLoggedIn: true,
    onToggleLike: async () => ({ likesCount: 3, isLiked: true }),
    onOpen: () => undefined,
    post: {
      _id: "p1",
      author: { name: "Alice" },
      content: "Hello community — one day at a time.",
      mediaUrls: [],
      mediaType: "none",
      likes: [],
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};
