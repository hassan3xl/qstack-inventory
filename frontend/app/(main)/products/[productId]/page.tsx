import React from "react";
import ProductDetailsClient from "@/components/products/ProductDetailsClient";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductDetailsPage({ params }: Props) {
  return <ProductDetailsClient />;
}
