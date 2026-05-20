import { deals } from "@/lib/dummyData";
import { Clock, Zap } from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import React from "react";
import Image from "next/image";

const FlashDeals = () => {
  return (
    <section className="mb-12 bg-muted p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="text-orange-500" size={28} />
          <h2 className="text-2xl font-bold text-primary">Flash Deals</h2>
        </div>
        <Link
          href="#"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-secondary rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <Image
                height={48}
                width={48}
                src={deal.image}
                alt={deal.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{deal.discount}%
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-primary mb-2">{deal.name}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-primary">
                  {formatNaira(deal.price)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatNaira(deal.original_price)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <Clock size={16} />
                <span className="text-sm font-medium">
                  Ends in {deal.endsIn}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FlashDeals;
