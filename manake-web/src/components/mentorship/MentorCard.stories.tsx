import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MentorCard, MentorCardSkeleton } from "./MentorCard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const meta: Meta<typeof MentorCard> = {
  title: "Components/Mentorship/MentorCard",
  component: MentorCard,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <div className="max-w-sm p-4">
            <Story />
          </div>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MentorCard>;

const baseMentor = {
  _id: "mentor-1",
  name: "Jane Smith",
  avatar: "",
  profile: {
    headline: "Recovery Advocate & Counselor",
    bio: "Passionate about helping others on their healing journey.",
  },
  mentorship: {
    isMentor: true,
    mentorshipStyle: "Supportive",
    yearsInRecovery: 5,
    specializations: ["Trauma Recovery", "Self-Care", "Emotional Healing"],
    averageRating: 4.8,
    availability: {
      hoursPerWeek: 5,
      preferredTimes: ["Weekday evenings", "Weekends"],
    },
  },
};

export const Default: Story = {
  args: {
    mentor: baseMentor,
  },
};

export const HighlyRated: Story = {
  args: {
    mentor: {
      ...baseMentor,
      name: "Dr. Sarah Johnson",
      mentorship: {
        ...baseMentor.mentorship,
        averageRating: 5.0,
        yearsInRecovery: 10,
      },
    },
  },
};

export const ManySpecializations: Story = {
  args: {
    mentor: {
      ...baseMentor,
      name: "Maria Garcia",
      mentorship: {
        ...baseMentor.mentorship,
        specializations: [
          "Trauma Recovery",
          "Self-Care",
          "Advocacy",
          "Legal Support",
          "Career Guidance",
        ],
      },
    },
  },
};

export const CoachingStyle: Story = {
  args: {
    mentor: {
      ...baseMentor,
      name: "Michael Brown",
      mentorship: {
        ...baseMentor.mentorship,
        mentorshipStyle: "Coaching",
      },
    },
  },
};

export const NewMentor: Story = {
  args: {
    mentor: {
      ...baseMentor,
      name: "Emily Chen",
      mentorship: {
        ...baseMentor.mentorship,
        yearsInRecovery: 1,
        averageRating: undefined,
      },
    },
  },
};

export const Loading: Story = {
  render: () => <MentorCardSkeleton />,
};
