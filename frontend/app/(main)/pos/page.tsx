import React, { Suspense } from "react";
import POSClient from "@/components/pos/POSClient";

export const dynamic = "force-dynamic";

export default function POSPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading POS...</div>}>
      <POSClient />
    </Suspense>
  );
}
