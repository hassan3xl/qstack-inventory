import React, { Suspense } from "react";
import ProductsInventoryClient from "@/components/products/ProductsInventoryClient";
import Loader from "@/components/Loader";

export const dynamic = "force-dynamic";

export default function ProductsInventoryPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProductsInventoryClient />
    </Suspense>
  );
}
