import React from "react";
import CategoryDetailsClient from "@/components/products/CategoryDetailsClient";

interface Props {
  params: {
    name: string;
  };
}

export default function CategoryDetailsPage({ params }: Props) {
  return (
    <CategoryDetailsClient />
  );
}
