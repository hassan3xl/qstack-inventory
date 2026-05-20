import React, { Suspense } from "react";
import SalesHistoryClient from "@/components/sales/SalesHistoryClient";

export const dynamic = "force-dynamic";

export default function SalesHistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading sales history...</div>}>
      <SalesHistoryClient />
    </Suspense>
  );
}
