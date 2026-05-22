import React, { Suspense } from "react";
import CustomersClient from "@/components/customers/CustomersClient";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading customers...</div>}>
      <CustomersClient />
    </Suspense>
  );
}
