"use client";

import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { productApi } from "@/lib/api/product.api";
import { Settings2 } from "lucide-react";
import { Button } from "../ui/button";
import EditCategoryModal from "./EditCategoryModal";

const CategoryDetailsClient = () => {
  const params = useParams();
  const name = params.name as string;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ Use Query
  const {
    data: category,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["category", name],
    queryFn: () => productApi.getCategoryDetail(name),
    retry: 1,
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground">
          Failed to load category details.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8 bg-card p-6 rounded-lg border border-border shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {name}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {category.product_count} products in this category
          </p>
          {category.expiry_strategy && (
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
              Strategy: {category.expiry_strategy}
            </div>
          )}
        </div>

        <Button
          onClick={() => setIsEditModalOpen(true)}
          variant="outline"
          className="rounded-lg border-border hover:bg-muted font-bold transition-all flex items-center gap-2"
        >
          <Settings2 size={18} />
          Edit Category
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {category.products?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <EditCategoryModal
        isModalOpen={isEditModalOpen}
        closeModal={() => setIsEditModalOpen(false)}
        categoryName={name}
      />
    </div>
  );
};

export default CategoryDetailsClient;
