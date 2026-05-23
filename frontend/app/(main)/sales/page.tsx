import React from "react";
import SalesHistoryClient from "@/components/sales/SalesHistoryClient";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { salesApi } from "@/lib/api/sales.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";

export const dynamic = "force-dynamic";

export default async function SalesHistoryPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.SALES,
    queryFn: () => salesApi.getSales(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SalesHistoryClient />
    </HydrationBoundary>
  );
}
