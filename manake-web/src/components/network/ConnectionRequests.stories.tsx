import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionRequestItemView } from "./ConnectionRequests";
import { fn } from "@storybook/test";

const meta: Meta<typeof ConnectionRequestItemView> = {
  title: "Network/ConnectionRequestItem",
  component: ConnectionRequestItemView,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    onAccept: fn(),
    onReject: fn(),
    isLoading: false,
    request: {
      _id: "req-1",
      userId: {
        _id: "user-1",
        name: "Jane Doe",
        avatar: "/images/default-avatar.png",
        profile: { headline: "Software Engineer at TechCorp" },
      },
      connectedUserId: "current-user",
      status: "pending",
      connectionType: "peer",
      initiatedAt: new Date().toISOString(),
      strength: 0,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionRequestItemView>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithoutHeadline: Story = {
  args: {
    request: {
      _id: "req-2",
      userId: {
        _id: "user-2",
        name: "John Smith",
        avatar: "/images/default-avatar.png",
      },
      connectedUserId: "current-user",
      status: "pending",
      connectionType: "mentor",
      initiatedAt: new Date().toISOString(),
      strength: 0,
    },
  },
};
