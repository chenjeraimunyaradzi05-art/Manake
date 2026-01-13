// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button", { name: /click/i })).toBeInTheDocument();
  });

  it("disables when loading", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button isLoading onClick={() => (clicked = true)}>
        Save
      </Button>,
    );

    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(clicked).toBe(false);
  });
});
