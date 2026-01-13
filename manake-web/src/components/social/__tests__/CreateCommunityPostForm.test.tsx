// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { CreateCommunityPostFormView } from "../CreateCommunityPostForm";

afterEach(() => cleanup());

describe("CreateCommunityPostForm", () => {
  it("disables input and submit when logged out", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn(async () => undefined);

    render(
      <CreateCommunityPostFormView
        isLoggedIn={false}
        isSubmitting={false}
        onCreatePost={onCreate}
      />,
    );

    const textbox = screen.getByRole("textbox");
    expect(textbox).toBeDisabled();
    expect(textbox).toHaveAttribute("placeholder", "Log in to post.");

    const postButton = screen.getByRole("button", { name: /post/i });
    expect(postButton).toBeDisabled();
    await user.click(postButton);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("submits trimmed content when logged in", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn(async () => undefined);

    render(
      <CreateCommunityPostFormView
        isLoggedIn
        isSubmitting={false}
        onCreatePost={onCreate}
      />,
    );

    await user.type(screen.getByRole("textbox"), "  hello world  ");
    await user.click(screen.getByRole("button", { name: /post/i }));

    expect(onCreate).toHaveBeenCalledWith("hello world");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
  });
});
