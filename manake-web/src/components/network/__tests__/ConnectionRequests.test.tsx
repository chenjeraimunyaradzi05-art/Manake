// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ConnectionRequestItemView } from "../ConnectionRequests";
import { ConnectionRequest } from "../../../services/connectionService";

afterEach(cleanup);

const mockRequest: ConnectionRequest = {
  _id: "req-1",
  userId: {
    _id: "user-1",
    name: "Jane Doe",
    avatar: "/images/jane.png",
    profile: { headline: "Software Engineer" },
  },
  connectedUserId: "current-user",
  status: "pending",
  connectionType: "peer",
  initiatedAt: new Date().toISOString(),
  strength: 0,
};

describe("ConnectionRequestItemView", () => {
  it("renders request information correctly", () => {
    render(
      <ConnectionRequestItemView
        request={mockRequest}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("calls onAccept when Accept button clicked", () => {
    const onAccept = vi.fn();
    render(
      <ConnectionRequestItemView
        request={mockRequest}
        onAccept={onAccept}
        onReject={vi.fn()}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /accept connection/i }));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onReject when Decline button clicked", () => {
    const onReject = vi.fn();
    render(
      <ConnectionRequestItemView
        request={mockRequest}
        onAccept={vi.fn()}
        onReject={onReject}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /decline connection/i }));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when loading", () => {
    render(
      <ConnectionRequestItemView
        request={mockRequest}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByRole("button", { name: /accept connection/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /decline connection/i })).toBeDisabled();
  });
});
