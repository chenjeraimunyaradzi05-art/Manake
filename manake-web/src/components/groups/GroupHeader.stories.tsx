import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { GroupHeader, GroupHeaderSkeleton } from "./GroupHeader";

const meta: Meta<typeof GroupHeader> = {
  title: "Components/Groups/GroupHeader",
  component: GroupHeader,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-4xl">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GroupHeader>;

const baseGroup = {
  _id: "group-1",
  name: "Survivors Support Circle",
  description: "A safe space for survivors to share experiences and support each other on their journey to healing. Join us for weekly discussions, resource sharing, and community building.",
  category: "support",
  memberCount: 156,
  isPrivate: false,
  isMember: false,
  isAdmin: false,
  icon: "💜",
  banner: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    group: baseGroup,
  },
};

export const Member: Story = {
  args: {
    group: {
      ...baseGroup,
      isMember: true,
    },
  },
};

export const Admin: Story = {
  args: {
    group: {
      ...baseGroup,
      isMember: true,
      isAdmin: true,
    },
  },
};

export const PrivateGroup: Story = {
  args: {
    group: {
      ...baseGroup,
      isPrivate: true,
      name: "Confidential Healing Space",
      description: "Private group for members with verified survivor status. This is a safe and confidential space.",
    },
  },
};

export const LargeGroup: Story = {
  args: {
    group: {
      ...baseGroup,
      name: "GBV Awareness Movement",
      memberCount: 12450,
      category: "advocacy",
      icon: "🌍",
    },
  },
};

export const Loading: Story = {
  render: () => <GroupHeaderSkeleton />,
};
