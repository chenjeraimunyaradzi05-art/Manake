// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SuggestionCardView } from "../ConnectionSuggestions";
import { ConnectionUser } from "../../../services/connectionService";

afterEach(cleanup);

const mockUser: ConnectionUser = {
  _id: "user-2",
  name: "John Smith",
  avatar: "/images/john.png",
  profile: {
    headline: "Product Manager",
    bio: "Passionate about building great products.",
  },
};

describe("SuggestionCardView", () => {
  it("renders user information correctly", () => {
    render(
      <SuggestionCardView
        user={mockUser}
        onConnect={vi.fn()}
        isConnecting={false}
      />
    );

    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("Passionate about building great products.")).toBeInTheDocument();
  });

  it("calls onConnect when Connect button clicked", () => {
    const onConnect = vi.fn();
    render(
      <SuggestionCardView
        user={mockUser}
        onConnect={onConnect}
        isConnecting={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /connect with john/i }));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("shows Sending... when connecting", () => {
    render(
      <SuggestionCardView
        user={mockUser}
        onConnect={vi.fn()}
        isConnecting={true}
      />
    );

    expect(screen.getByText("Sending...")).toBeInTheDocument();
  });

  it("disables button when connecting", () => {
    render(
      <SuggestionCardView
        user={mockUser}
        onConnect={vi.fn()}
        isConnecting={true}
      />
    );

    expect(screen.getByRole("button", { name: /connect with john/i })).toBeDisabled();
  });
});
