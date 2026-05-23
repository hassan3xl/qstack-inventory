import React, { Suspense } from "react";
import POSClient from "@/components/pos/POSClient";
import { productApi } from "@/lib/api/product.api";
import { salesApi } from "@/lib/api/sales.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.PRODUCTS,
      queryFn: productApi.getProducts,
    }),
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.CUSTOMERS(),
      queryFn: () => salesApi.getCustomers(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <POSClient />
    </HydrationBoundary>
  );
}
