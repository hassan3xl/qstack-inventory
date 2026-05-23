import React from "react";
import ProductDetailsClient from "@/components/products/ProductDetailsClient";
import { productApi } from "@/lib/api/product.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: Props) {
  const { productId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.PRODUCT(productId),
    queryFn: () => productApi.getProduct(productId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailsClient />
    </HydrationBoundary>
  );
}
