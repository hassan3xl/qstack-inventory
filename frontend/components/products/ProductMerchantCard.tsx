import React from "react";
import { BadgeCheck, Star, Store, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types/product.types";
import { Merchant } from "@/lib/types/merchant.types";

interface ProductMerchantCardProps {
  product: Product;
}

const ProductMerchantCard = ({ product }: ProductMerchantCardProps) => {
  if (!product.merchant) {
    return null;
  }

  const merchant = product.merchant as Merchant;

  return (
    <div className="mt-6">
      {/* Merchant Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            {/* Merchant Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Image
                  src={merchant?.store_logo || "/default_avatar.png"}
                  width={56}
                  height={56}
                  alt={`${merchant.store_name} logo`}
                  className="rounded-lg object-cover w-12 h-12 sm:w-14 sm:h-14 border border-border"
                />
                {merchant.verification_status === "verified" && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 ring-2 ring-card">
                    <BadgeCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                    {merchant.store_name}
                  </h3>
                  {merchant.verification_status === "verified" && (
                    <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                </div>

                {/* Rating */}
                {merchant.average_rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium text-foreground">
                      {merchant.average_rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({merchant.total_sales || 0} sales)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Visit Button */}
            <Link
              href={`/merchants/${merchant.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-all group/btn shrink-0"
            >
              <span className="hidden sm:inline">Visit Store</span>
              <span className="sm:hidden">Visit</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMerchantCard;
