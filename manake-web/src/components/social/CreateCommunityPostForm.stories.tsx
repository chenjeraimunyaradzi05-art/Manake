import type { Meta, StoryObj } from "@storybook/react";
import { CreateCommunityPostFormView } from "./CreateCommunityPostForm";

const meta: Meta<typeof CreateCommunityPostFormView> = {
  title: "Social/CreateCommunityPostForm",
  component: CreateCommunityPostFormView,
};

export default meta;
type Story = StoryObj<typeof CreateCommunityPostFormView>;

export const LoggedOut: Story = {
  args: {
    isLoggedIn: false,
    isSubmitting: false,
    onCreatePost: async () => undefined,
  },
};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
    isSubmitting: false,
    onCreatePost: async () => undefined,
  },
};
