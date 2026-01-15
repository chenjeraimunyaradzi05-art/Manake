import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import React, { ReactElement } from "react";

type CompatibleReactNode = Exclude<React.ReactNode, bigint>;

interface RenderWithRouterOptions extends Omit<RenderOptions, "wrapper"> {
  routerProps?: Omit<MemoryRouterProps, "children">;
}

/**
 * Render a component wrapped in MemoryRouter with v7 future flags enabled.
 * Use this instead of manually wrapping in MemoryRouter in tests.
 */
export function renderWithRouter(
  ui: ReactElement,
  { routerProps, ...renderOptions }: RenderWithRouterOptions = {},
) {
  const Wrapper = ({ children }: { children: CompatibleReactNode }) => (
    <MemoryRouter {...routerProps}>{children}</MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
