import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  args: { name: "Manake Center", size: "lg" },
};

export const WithStatus: Story = {
  args: { name: "Jane Doe", size: "lg", status: "online" },
};
