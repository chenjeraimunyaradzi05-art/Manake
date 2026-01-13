// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderWithRouter } from "../../../test/testUtils";
import { MentorCard, MentorCardSkeleton } from "../MentorCard";

const mockMutate = vi.fn();

// Mock the hooks
vi.mock("../../../hooks/useMentorship", () => ({
  useRequestMentorship: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

afterEach(() => {
  cleanup();
  mockMutate.mockClear();
});

const mockMentor = {
  _id: "mentor-1",
  name: "Jane Smith",
  avatar: "",
  profile: {
    headline: "Recovery Advocate",
    bio: "Helping others on their journey.",
  },
  mentorship: {
    isMentor: true,
    mentorshipStyle: "Supportive",
    yearsInRecovery: 5,
    specializations: ["Trauma Recovery", "Self-Care"],
    averageRating: 4.8,
    availability: {
      hoursPerWeek: 5,
      preferredTimes: ["Weekday evenings"],
    },
  },
};

describe("MentorCard", () => {
  it("renders mentor name and headline", () => {
    renderWithRouter(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Recovery Advocate")).toBeInTheDocument();
  });

  it("displays mentorship style", () => {
    renderWithRouter(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText("Supportive")).toBeInTheDocument();
  });

  it("displays years in recovery", () => {
    renderWithRouter(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText("5+ years in recovery")).toBeInTheDocument();
  });

  it("displays specializations", () => {
    renderWithRouter(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText("Trauma Recovery")).toBeInTheDocument();
    expect(screen.getByText("Self-Care")).toBeInTheDocument();
  });

  it("displays rating", () => {
    renderWithRouter(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText("(4.8)")).toBeInTheDocument();
  });

  it("shows View Profile and Request buttons", () => {
    renderWithRouter(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText("View Profile")).toBeInTheDocument();
    expect(screen.getByText("Request")).toBeInTheDocument();
  });

  it("renders mentor initial when no avatar", () => {
    renderWithRouter(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("calls onViewDetails when View Profile clicked", () => {
    const handleViewDetails = vi.fn();
    renderWithRouter(
      <MentorCard mentor={mockMentor} onViewDetails={handleViewDetails} />
    );

    screen.getByText("View Profile").click();
    expect(handleViewDetails).toHaveBeenCalledWith(mockMentor);
  });
});

describe("MentorCardSkeleton", () => {
  it("renders skeleton loading state", () => {
    const { container } = render(<MentorCardSkeleton />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
