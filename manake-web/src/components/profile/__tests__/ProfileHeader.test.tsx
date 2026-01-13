// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { renderWithRouter } from "../../../test/testUtils";
import { ProfileHeader } from "../ProfileHeader";
import { UserProfile } from "../../../services/profileService";

afterEach(cleanup);

const mockUser: UserProfile = {
  _id: "user-1",
  name: "Jane Doe",
  avatar: "/images/jane.png",
  profile: {
    headline: "Recovery Advocate",
    location: "Harare, Zimbabwe",
    bio: "Passionate about helping others.",
    interests: ["meditation", "hiking"],
  },
  mentorship: {
    isMentor: true,
    yearsInRecovery: 5,
  },
  milestones: {
    recoveryDaysCount: 365,
  },
  isEmailVerified: true,
};

describe("ProfileHeader", () => {
  it("renders user information correctly", () => {
    renderWithRouter(
      <ProfileHeader user={mockUser} isOwnProfile={false} />
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Recovery Advocate")).toBeInTheDocument();
    expect(screen.getByText(/Harare, Zimbabwe/)).toBeInTheDocument();
  });

  it("shows mentor badge when user is mentor", () => {
    renderWithRouter(
      <ProfileHeader user={mockUser} isOwnProfile={false} />
    );

    expect(screen.getByText(/Mentor/)).toBeInTheDocument();
  });

  it("shows milestone badge when user has recovery days", () => {
    renderWithRouter(
      <ProfileHeader user={mockUser} isOwnProfile={false} />
    );

    expect(screen.getByText(/365 days/)).toBeInTheDocument();
  });

  it("shows Edit Profile button for own profile", () => {
    renderWithRouter(
      <ProfileHeader user={mockUser} isOwnProfile={true} />
    );

    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });

  it("shows Connect and Message buttons for other profiles", () => {
    const onConnect = vi.fn();
    const onMessage = vi.fn();

    renderWithRouter(
      <ProfileHeader
        user={mockUser}
        isOwnProfile={false}
        onConnect={onConnect}
        onMessage={onMessage}
      />
    );

    expect(screen.getByRole("button", { name: /connect with/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /message/i })).toBeInTheDocument();
  });
});
