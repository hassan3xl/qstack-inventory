import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

// cache() is used to memoize the query client during a single request
// so that the same query client is used throughout the server component tree.
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    }),
);

export default getQueryClient;
