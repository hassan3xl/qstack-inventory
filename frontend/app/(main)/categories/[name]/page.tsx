import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { productApi } from "@/lib/api/product.api";
import CategoryDetailsClient from "@/components/products/CategoryDetailsClient";

interface Props {
  params: {
    name: string;
  };
}

export default async function CategoryDetailsPage({ params }: Props) {
  const { name } = params;
  const queryClient = getQueryClient();

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["category", name],
    queryFn: () => productApi.getCategoryDetail(name),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryDetailsClient />
    </HydrationBoundary>
  );
}
