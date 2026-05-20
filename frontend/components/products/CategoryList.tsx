import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/types/product.types";

interface CategoryListProps {
  category: Category;
}

const CategoryList: React.FC<CategoryListProps> = ({ category }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border bg-card">
      <Link
        href={`/categories/${category.name}`}
        className="block relative aspect-square"
      >
        <Image
          src={category.image || "/placeholder.png"}
          alt={category.name}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex flex-col justify-end p-3">
          {category.expiry_strategy && category.expiry_strategy !== "GENERAL" && (
            <span className="absolute top-2 right-2 bg-blue-600/80 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              {category.expiry_strategy}
            </span>
          )}
          <h3 className="text-white text-base sm:text-lg font-semibold drop-shadow-md">
            {category.name}
          </h3>
          <p className="text-gray-200 text-xs sm:text-sm">
            {category.product_count || 0} items
          </p>
        </div>
      </Link>
    </div>
  );
};

export default CategoryList;
