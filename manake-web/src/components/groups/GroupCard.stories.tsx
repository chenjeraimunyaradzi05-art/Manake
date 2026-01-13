import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { GroupCard, GroupCardSkeleton } from "./GroupCard";

const meta: Meta<typeof GroupCard> = {
  title: "Components/Groups/GroupCard",
  component: GroupCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-sm p-4">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GroupCard>;

const baseGroup = {
  _id: "group-1",
  name: "Survivors Support Circle",
  description: "A safe space for survivors to share experiences and support each other on their journey to healing.",
  category: "support",
  memberCount: 156,
  isPrivate: false,
  isMember: false,
  icon: "💜",
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

export const PrivateGroup: Story = {
  args: {
    group: {
      ...baseGroup,
      isPrivate: true,
      name: "Confidential Healing Space",
      description: "Private group for members with verified survivor status.",
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

export const EducationCategory: Story = {
  args: {
    group: {
      ...baseGroup,
      name: "Legal Rights Education",
      description: "Learn about your legal rights and access to justice.",
      category: "education",
      memberCount: 89,
      icon: "📚",
    },
  },
};

export const Loading: Story = {
  render: () => <GroupCardSkeleton />,
};
