import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { productApi } from "@/lib/api/product.api";
import ProductDetailsClient from "@/components/products/ProductDetailsClient";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductDetailsPage({ params }: Props) {
  const { productId } = await params;
  const queryClient = getQueryClient();

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["product", productId],
    queryFn: () => productApi.getProduct(productId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailsClient />
    </HydrationBoundary>
  );
}
