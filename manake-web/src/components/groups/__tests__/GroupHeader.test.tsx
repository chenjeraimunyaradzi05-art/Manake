// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderWithRouter } from "../../../test/testUtils";
import { GroupHeader, GroupHeaderSkeleton } from "../GroupHeader";

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
  postCount: 42,
  isPrivate: false,
  isMember: false,
  isAdmin: false,
  icon: "",
  banner: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("GroupHeader", () => {
  it("renders group name and description", () => {
    renderWithRouter(<GroupHeader group={mockGroup} />);

    expect(screen.getByText("Survivors Support Circle")).toBeInTheDocument();
    expect(
      screen.getByText(/A safe space for survivors to share experiences/)
    ).toBeInTheDocument();
  });

  it("displays member count", () => {
    renderWithRouter(<GroupHeader group={mockGroup} />);

    expect(screen.getByText("156 members")).toBeInTheDocument();
  });

  it("shows join button when not a member", () => {
    renderWithRouter(<GroupHeader group={mockGroup} />);

    expect(screen.getByText("Join Group")).toBeInTheDocument();
  });

  it("shows leave button when already a member", () => {
    const memberGroup = { ...mockGroup, isMember: true };
    renderWithRouter(<GroupHeader group={memberGroup} />);

    expect(screen.getByText("Leave Group")).toBeInTheDocument();
  });

  it("calls join mutation when join button clicked", () => {
    renderWithRouter(<GroupHeader group={mockGroup} />);

    fireEvent.click(screen.getByText("Join Group"));
    expect(mockMutate).toHaveBeenCalledWith("group-1");
  });

  it("calls leave mutation when leave button clicked", () => {
    const memberGroup = { ...mockGroup, isMember: true };
    renderWithRouter(<GroupHeader group={memberGroup} />);

    fireEvent.click(screen.getByText("Leave Group"));
    expect(mockMutate).toHaveBeenCalledWith("group-1");
  });

  it("shows settings link for admins", () => {
    const adminGroup = { ...mockGroup, isMember: true, isAdmin: true };
    renderWithRouter(<GroupHeader group={adminGroup} />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("does not show settings link for non-admins", () => {
    const memberGroup = { ...mockGroup, isMember: true };
    renderWithRouter(<GroupHeader group={memberGroup} />);

    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("displays private badge for private groups", () => {
    const privateGroup = { ...mockGroup, isPrivate: true };
    renderWithRouter(<GroupHeader group={privateGroup} />);

    expect(screen.getByText(/Private/)).toBeInTheDocument();
  });

  it("renders group initial when no icon", () => {
    renderWithRouter(<GroupHeader group={mockGroup} />);

    expect(screen.getByText("S")).toBeInTheDocument();
  });
});

describe("GroupHeaderSkeleton", () => {
  it("renders skeleton loading state", () => {
    const { container } = render(<GroupHeaderSkeleton />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
