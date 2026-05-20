import DashboardClient from "@/components/DashboardClient";
import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { productApi } from "@/lib/api/product.api";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const queryClient = getQueryClient();

  // Prefetch products data on the server
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getProducts(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <DashboardClient />
      </div>
    </HydrationBoundary>
  );
}
