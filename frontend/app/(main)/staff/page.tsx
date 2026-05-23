import React from "react";
import StaffClient from "@/components/staff/StaffClient";
import { StoreApi } from "@/lib/api/store.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.STAFF_LIST,
    queryFn: () => StoreApi.getStaff(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffClient />
    </HydrationBoundary>
  );
}
