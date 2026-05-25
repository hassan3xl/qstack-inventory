"use client";

import React, { useState } from "react";
import CategoryList from "@/components/products/CategoryList";
import { useGetProductsCategories } from "@/lib/hooks/product.hook";
import { Category } from "@/lib/types/product.types";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";

import Loader from "@/components/Loader";
import Header from "../Header";

const CategoriesInventoryClient: React.FC = () => {
  const { data: categories, isLoading, error } = useGetProductsCategories();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const categoriesArray = Array.isArray(categories) ? categories : [];

  return (
    <section className=" relative min-h-[60vh]">
      {/* {(isLoading) && (
        <div className="absolute inset-0 z-50 bg-background/50 flex items-center justify-center backdrop-blur-sm rounded-lg">
          <Loader title="Loading categories..." fullscreen={false} />
        </div>
      )} */}

      {error && !categories && (
        <div className="absolute inset-0 z-40 bg-background/50 flex flex-col items-center justify-center rounded-lg">
          <p className="text-red-500 font-bold">Failed to load categories.</p>
        </div>
      )}

      <Header title="Browse by Category" subtitle="Manage your store's product classifications." 
      actions={<div className="flex items-center gap-4"> <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-primary/10 transition-transform active:scale-95 duration-100"
        >
          <Plus size={18} />
          <span>Add Category</span>
        </Button></div>}
      />
      

      {categoriesArray.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] border border-dashed border-border rounded-lg p-8 bg-card">
          <p className="text-muted-foreground font-semibold">
            No custom categories created yet.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1 mb-4">
            Create your first product category to start listing products.
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="rounded-lg"
          >
            <Plus size={16} className="mr-1.5" />
            Create Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoriesArray.map((category: Category) => (
            <div key={category.id}>
              <CategoryList category={category} />
            </div>
          ))}
        </div>
      )}

      <AddCategoryModal
        isModalOpen={isAddModalOpen}
        closeModal={() => setIsAddModalOpen(false)}
      />
    </section>
  );
};

export default CategoriesInventoryClient;
