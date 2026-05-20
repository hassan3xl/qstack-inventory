import { featuredProducts } from "@/lib/dummyData";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import React from "react";

const TrendingProducts = () => {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-primary">Trending Now</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {featuredProducts.slice(0, 6).map((product) => (
          <Link key={product.id} href="#" className="group">
            <div className="relative overflow-hidden rounded-lg mb-2 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h4 className="text-sm font-medium text-primary line-clamp-2 mb-1">
              {product.name}
            </h4>
            <p className="text-lg font-bold text-primary">{formatNaira(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
