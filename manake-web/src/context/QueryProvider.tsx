import { useState } from "react";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type CompatibleReactNode = Exclude<React.ReactNode, bigint>;
type QueryProviderProps = { children?: CompatibleReactNode };

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
