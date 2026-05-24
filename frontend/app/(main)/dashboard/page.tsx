import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";
import { productApi } from "@/lib/api/product.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.PRODUCTS,
      queryFn: productApi.getProducts,
    }),
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.INVENTORY_STATS,
      queryFn: productApi.getInventoryStats,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
