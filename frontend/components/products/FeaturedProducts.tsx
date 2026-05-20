import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import Loader from "../Loader";
import { Product } from "@/lib/types/product.types";

const FeaturedProducts = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/products/`, {
    next: { revalidate: 60 }, // revalidate every 60 seconds
  });

  if (!res.ok) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground">Failed to load products.</p>
      </div>
    );
  }

  const products: Product[] = await res.json();

  return (
    <section className="my-4 border-t border-border">
      <div className="flex items-center  justify-between pb-6">
        <h2 className="text-2xl mt-2 font-bold text-primary">
          Featured Products
        </h2>
        <Link
          href="#"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))
        ) : (
          <p>No featured products yet.</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
