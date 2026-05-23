import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import FinanceClient from "@/components/finance/FinanceClient";
import { productApi } from "@/lib/api/product.api";
import { salesApi } from "@/lib/api/sales.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const queryClient = new QueryClient();

  // Fetch happens on the SERVER — zero client waterfall
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.INVENTORY_STATS,
      queryFn: productApi.getInventoryStats,
    }),
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.SALES,
      queryFn: salesApi.getSales,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FinanceClient />
    </HydrationBoundary>
  );
}
