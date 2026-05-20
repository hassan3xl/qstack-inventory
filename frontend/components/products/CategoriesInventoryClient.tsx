"use client";

import CategoryList from "@/components/products/CategoryList";
import { useGetProductsCategories } from "@/lib/hooks/product.hook";
import { Category } from "@/lib/types/product.types";

const CategoriesInventoryClient: React.FC = () => {
  const { data: categories, isLoading, error } = useGetProductsCategories();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !categories) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground">Failed to load categories.</p>
      </div>
    );
  }

  const categoriesArray = Array.isArray(categories) ? categories : [];

  if (categoriesArray.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground">No categories available.</p>
      </div>
    );
  }

  return (
    <section className="my-4 border-t border-border">
      <h2 className="text-2xl mt-2 font-bold py-2 text-primary">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {categoriesArray.map((category: Category) => (
          <div key={category.id}>
            <CategoryList category={category} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesInventoryClient;
