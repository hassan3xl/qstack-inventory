import React from "react";
import ProductsInventoryClient from "@/components/products/ProductsInventoryClient";
import { productApi } from "@/lib/api/product.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

export default async function ProductsInventoryPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: productApi.getProducts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsInventoryClient />
    </HydrationBoundary>
  );
}
