import React, { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { productApi } from "@/lib/api/product.api";
import ProductsInventoryClient from "@/components/products/ProductsInventoryClient";

export const dynamic = "force-dynamic";

export default async function ProductsInventoryPage() {
  const queryClient = getQueryClient();

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: productApi.getProducts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsInventoryClient />
      </Suspense>
    </HydrationBoundary>
  );
}
