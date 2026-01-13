import type { Meta, StoryObj } from "@storybook/react";
import { SuggestionCardView } from "./ConnectionSuggestions";
import { fn } from "@storybook/test";

const meta: Meta<typeof SuggestionCardView> = {
  title: "Network/SuggestionCard",
  component: SuggestionCardView,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    onConnect: fn(),
    isConnecting: false,
    user: {
      _id: "user-1",
      name: "Alex Johnson",
      avatar: "/images/default-avatar.png",
      profile: {
        headline: "UX Designer",
        bio: "Passionate about creating beautiful, accessible user experiences.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SuggestionCardView>;

export const Default: Story = {};

export const Connecting: Story = {
  args: {
    isConnecting: true,
  },
};

export const WithoutBio: Story = {
  args: {
    user: {
      _id: "user-2",
      name: "Sam Rivera",
      avatar: "/images/default-avatar.png",
      profile: {
        headline: "Data Scientist",
      },
    },
  },
};

export const MinimalProfile: Story = {
  args: {
    user: {
      _id: "user-3",
      name: "Chris Lee",
    },
  },
};
