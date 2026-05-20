import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { productApi } from "@/lib/api/product.api";
import CategoriesInventoryClient from "@/components/products/CategoriesInventoryClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const queryClient = getQueryClient();

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: productApi.getProductsCategory,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesInventoryClient />
    </HydrationBoundary>
  );
}
