// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Input } from "../Input";

describe("Input", () => {
  it("associates label with input", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders error text", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
