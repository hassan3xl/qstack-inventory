import React from "react";
import Image from "next/image";
import { Category } from "@/lib/types/product.types";
import { ChevronRight } from "lucide-react";

interface CategoryListProps {
  category: Category;
  onClick?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ category, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-all duration-300"
    >
      {/* Mobile Layout: Slip Card (horizontal) */}
      <div className="flex sm:hidden items-center justify-between p-3.5 bg-card border border-border/80 rounded-xl shadow-xs hover:shadow-md hover:border-primary/20 active:scale-[0.99] transition-all duration-200 gap-3.5">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border/40">
            <Image
              src={category?.image || "/default_product.png"}
              alt={category?.name}
              fill
              sizes="56px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {category.name}
            </span>
            <span className="text-[11px] text-muted-foreground font-semibold">
              {category.product_count || 0} items
            </span>
            {category.expiry_strategy &&
              category.expiry_strategy !== "GENERAL" && (
                <span className="mt-1 self-start bg-primary/10 text-primary text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-sm">
                  {category.expiry_strategy}
                </span>
              )}
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Tablet & Desktop Layout: Grid Card */}
      <div className="hidden sm:block relative aspect-square overflow-hidden rounded-xl border border-border/80 shadow-xs hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-card">
        <Image
          src={category?.image || "/default_product.png"}
          alt={category?.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex flex-col justify-end p-4">
          {category.expiry_strategy &&
            category.expiry_strategy !== "GENERAL" && (
              <span className="absolute top-3 right-3 bg-primary/95 text-primary-foreground text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                {category.expiry_strategy}
              </span>
            )}
          <h3 className="text-white text-base font-bold drop-shadow-md truncate group-hover:text-primary-foreground/90 transition-colors">
            {category.name}
          </h3>
          <p className="text-gray-200 text-xs mt-0.5">
            {category.product_count || 0} items
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
