import type { Meta, StoryObj } from "@storybook/react";
import { ProfileAbout } from "./ProfileAbout";
import { fn } from "@storybook/test";

const meta: Meta<typeof ProfileAbout> = {
  title: "Profile/ProfileAbout",
  component: ProfileAbout,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    editable: false,
    onSave: fn(),
    isSaving: false,
    user: {
      _id: "user-1",
      name: "Jane Doe",
      profile: {
        bio: "I'm a recovery advocate with 5 years of experience helping others on their journey. Passionate about meditation, fitness, and community building.",
        interests: ["meditation", "yoga", "hiking", "reading", "community service"],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileAbout>;

export const Default: Story = {};

export const Editable: Story = {
  args: {
    editable: true,
  },
};

export const NoBio: Story = {
  args: {
    user: {
      _id: "user-2",
      name: "New User",
      profile: {},
    },
  },
};

export const NoInterests: Story = {
  args: {
    user: {
      _id: "user-3",
      name: "User",
      profile: {
        bio: "Just getting started on my recovery journey.",
      },
    },
  },
};

export const Saving: Story = {
  args: {
    editable: true,
    isSaving: true,
  },
};
