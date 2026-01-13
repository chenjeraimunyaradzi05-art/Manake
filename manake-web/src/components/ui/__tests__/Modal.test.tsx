// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("renders when open", () => {
    render(
      <Modal isOpen onClose={() => undefined} size="md" title="Hello">
        Content
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it("closes on escape", async () => {
    const user = userEvent.setup();
    let closed = false;
    render(
      <Modal isOpen onClose={() => (closed = true)} size="md" title="Hello">
        Content
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(closed).toBe(true);
  });
});
