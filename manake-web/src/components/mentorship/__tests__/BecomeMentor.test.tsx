// @vitest-environment jsdom
import { screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderWithRouter } from "../../../test/testUtils";
import { BecomeMentor } from "../BecomeMentor";

// Mock the hooks
vi.mock("../../../hooks/useMentorship", () => ({
  useBecomeMentor: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  }),
  useUpdateMentorSettings: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  }),
}));

// Mock the auth context
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      mentorship: {
        isMentor: false,
      },
      profile: {},
      privacy: {},
    },
    isAuthenticated: true,
  }),
}));

afterEach(cleanup);

describe("BecomeMentor", () => {
  it("renders become mentor form title", () => {
    renderWithRouter(<BecomeMentor />);

    expect(screen.getByRole("heading", { name: "Become a Mentor" })).toBeInTheDocument();
  });

  it("displays eligibility requirements", () => {
    renderWithRouter(<BecomeMentor />);

    expect(screen.getByText("✓ Eligibility Requirements")).toBeInTheDocument();
  });

  it("shows years in recovery selector", () => {
    renderWithRouter(<BecomeMentor />);

    expect(screen.getByText("Years in Recovery *")).toBeInTheDocument();
  });

  it("shows mentorship style options", () => {
    renderWithRouter(<BecomeMentor />);

    expect(screen.getByText("Mentorship Style *")).toBeInTheDocument();
    expect(
      screen.getByText("Supportive - Warm and encouraging approach")
    ).toBeInTheDocument();
  });

  it("shows specializations options", () => {
    renderWithRouter(<BecomeMentor />);

    expect(
      screen.getByText("Specializations * (select all that apply)")
    ).toBeInTheDocument();
    expect(screen.getByText("Trauma Recovery")).toBeInTheDocument();
    expect(screen.getByText("Emotional Healing")).toBeInTheDocument();
  });

  it("shows availability slider", () => {
    renderWithRouter(<BecomeMentor />);

    expect(screen.getByText("Hours Available Per Week")).toBeInTheDocument();
  });

  it("shows guidelines acceptance checkbox", () => {
    renderWithRouter(<BecomeMentor />);

    expect(screen.getByText("Mentorship Guidelines")).toBeInTheDocument();
    expect(
      screen.getByText(/I have read and agree to follow/)
    ).toBeInTheDocument();
  });

  it("shows submit button", () => {
    renderWithRouter(<BecomeMentor />);

    expect(
      screen.getByRole("button", { name: "Become a Mentor" })
    ).toBeInTheDocument();
  });
});
