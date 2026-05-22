import React, { Suspense } from "react";
import FinanceClient from "@/components/finance/FinanceClient";

export const dynamic = "force-dynamic";

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading finance data...</div>}>
      <FinanceClient />
    </Suspense>
  );
}
