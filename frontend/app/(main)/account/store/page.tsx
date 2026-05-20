import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { StoreApi } from "@/lib/api/store.api";
import StoreSettingsClient from "@/components/account/StoreSettingsClient";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  const queryClient = getQueryClient();

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["store"],
    queryFn: StoreApi.getStore,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoreSettingsClient />
    </HydrationBoundary>
  );
}
