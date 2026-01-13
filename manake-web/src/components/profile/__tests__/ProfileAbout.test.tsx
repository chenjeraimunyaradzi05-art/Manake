// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ProfileAbout } from "../ProfileAbout";
import { UserProfile } from "../../../services/profileService";

afterEach(cleanup);

const mockUser: UserProfile = {
  _id: "user-1",
  name: "Jane Doe",
  profile: {
    bio: "This is my bio text.",
    interests: ["meditation", "yoga", "running"],
  },
};

describe("ProfileAbout", () => {
  it("renders bio correctly", () => {
    render(<ProfileAbout user={mockUser} />);

    expect(screen.getByText("This is my bio text.")).toBeInTheDocument();
  });

  it("renders interests as tags", () => {
    render(<ProfileAbout user={mockUser} />);

    expect(screen.getByText("meditation")).toBeInTheDocument();
    expect(screen.getByText("yoga")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("shows edit button when editable", () => {
    render(<ProfileAbout user={mockUser} editable />);

    expect(screen.getByRole("button", { name: /edit about/i })).toBeInTheDocument();
  });

  it("shows empty state when no bio", () => {
    const userNoBio: UserProfile = { _id: "u1", name: "Test" };
    render(<ProfileAbout user={userNoBio} />);

    expect(screen.getByText("No bio yet.")).toBeInTheDocument();
  });

  it("enters edit mode when edit clicked", () => {
    render(<ProfileAbout user={mockUser} editable />);

    fireEvent.click(screen.getByRole("button", { name: /edit about/i }));

    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});
