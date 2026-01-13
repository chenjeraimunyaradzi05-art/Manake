import type { Meta, StoryObj } from "@storybook/react";
import { ProfileHeader } from "./ProfileHeader";
import { fn } from "@storybook/test";

const meta: Meta<typeof ProfileHeader> = {
  title: "Profile/ProfileHeader",
  component: ProfileHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    onConnect: fn(),
    onMessage: fn(),
    isConnecting: false,
    isOwnProfile: false,
    user: {
      _id: "user-1",
      name: "Jane Doe",
      avatar: "/images/default-avatar.png",
      profile: {
        headline: "Recovery Advocate | Peer Support Specialist",
        location: "Harare, Zimbabwe",
        bio: "Passionate about helping others on their recovery journey.",
      },
      mentorship: {
        isMentor: true,
        yearsInRecovery: 5,
      },
      milestones: {
        recoveryDaysCount: 365,
      },
      isEmailVerified: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileHeader>;

export const Default: Story = {};

export const OwnProfile: Story = {
  args: {
    isOwnProfile: true,
  },
};

export const NotMentor: Story = {
  args: {
    user: {
      _id: "user-2",
      name: "John Smith",
      profile: {
        headline: "Community Member",
      },
    },
  },
};

export const Connecting: Story = {
  args: {
    isConnecting: true,
  },
};

export const MinimalProfile: Story = {
  args: {
    user: {
      _id: "user-3",
      name: "New User",
    },
  },
};
