// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderWithRouter } from "../../../test/testUtils";
import { GroupCard, GroupCardSkeleton } from "../GroupCard";

const mockMutate = vi.fn();

// Mock the useGroups hooks
vi.mock("../../../hooks/useGroups", () => ({
  useJoinGroup: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useLeaveGroup: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

afterEach(() => {
  cleanup();
  mockMutate.mockClear();
});

const mockGroup = {
  _id: "group-1",
  name: "Survivors Support Circle",
  description: "A safe space for survivors to share experiences and support each other.",
  category: "support",
  memberCount: 156,
  isPrivate: false,
  isMember: false,
  icon: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("GroupCard", () => {
  it("renders group name and description", () => {
    renderWithRouter(<GroupCard group={mockGroup} />);

    expect(screen.getByText("Survivors Support Circle")).toBeInTheDocument();
    expect(
      screen.getByText(/A safe space for survivors to share experiences/)
    ).toBeInTheDocument();
  });

  it("displays member count", () => {
    renderWithRouter(<GroupCard group={mockGroup} />);

    expect(screen.getByText("156 members")).toBeInTheDocument();
  });

  it("shows join button when not a member", () => {
    renderWithRouter(<GroupCard group={mockGroup} />);

    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  it("shows leave button when already a member", () => {
    const memberGroup = { ...mockGroup, isMember: true };
    renderWithRouter(<GroupCard group={memberGroup} />);

    expect(screen.getByText("Leave")).toBeInTheDocument();
  });

  it("calls join mutation when join button clicked", () => {
    renderWithRouter(<GroupCard group={mockGroup} />);

    fireEvent.click(screen.getByText("Join"));
    expect(mockMutate).toHaveBeenCalledWith("group-1");
  });

  it("calls leave mutation when leave button clicked", () => {
    const memberGroup = { ...mockGroup, isMember: true };
    renderWithRouter(<GroupCard group={memberGroup} />);

    fireEvent.click(screen.getByText("Leave"));
    expect(mockMutate).toHaveBeenCalledWith("group-1");
  });

  it("displays private badge for private groups", () => {
    const privateGroup = { ...mockGroup, isPrivate: true };
    renderWithRouter(<GroupCard group={privateGroup} />);

    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("displays category badge", () => {
    renderWithRouter(<GroupCard group={mockGroup} />);

    expect(screen.getByText("support")).toBeInTheDocument();
  });

  it("renders group initial when no icon", () => {
    renderWithRouter(<GroupCard group={mockGroup} />);

    expect(screen.getByText("S")).toBeInTheDocument();
  });
});

describe("GroupCardSkeleton", () => {
  it("renders skeleton loading state", () => {
    const { container } = render(<GroupCardSkeleton />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
