"use client";

import { Edit, Trash2, Eye, MoreVertical, Package, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { apiService } from "@/lib/services/apiService";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProduct } from "@/lib/hooks/product.hook";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { Product } from "@/lib/types/product.types";

interface ProductCardProps {
  product: Product;
  merchantView?: boolean;
}

const ProductCard = ({ product, merchantView = false }: ProductCardProps) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const deleteMutation = useDeleteProduct();

  const viewProductDetails = () => {
    router.push(`/products/${product.id}`);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync(product.id);

      toast.success("Product deleted successfully!", {
        description: `${product.name} has been deleted.`,
      });
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  // Get first image or fallback
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]?.image
      : "/default_product.png";

  // Stock status
  const stockCount = product.stock ?? 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;
  const isOutOfStock = stockCount === 0;

  // Expiry status
  const isExpired = product.is_expired;
  const isExpiringSoon =
    product.expiry_date &&
    !isExpired &&
    (new Date(product.expiry_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24) <=
      7;

  const isExpiringByAI =
    product.predicted_expiry_date &&
    !isExpired &&
    (new Date(product.predicted_expiry_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24) <=
      1; // Less than 24 hours

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group relative">
      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
        {!product.is_active && (
          <div className="bg-slate-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
            Archived
          </div>
        )}
        {isExpired && (
          <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse">
            Expired
          </div>
        )}
        {isExpiringByAI && !isExpired && (
          <div className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg animate-bounce">
            AI: Imminent Expiry
          </div>
        )}
        {isExpiringSoon && !isExpired && !isExpiringByAI && (
          <div className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
            Expiring Soon
          </div>
        )}
      </div>

      {/* Image Container */}
      <div
        className="relative overflow-hidden aspect-square bg-muted/30"
      >
        <Image
          src={imageError ? "/default_product.png" : productImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setImageError(true)}
          unoptimized
        />
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest mb-1">
            {product.category?.name || "Inventory Item"}
          </p>
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Variants & Capacity Specs */}
          {((product.variants && product.variants.length > 0) || (product.capacities && product.capacities.length > 0)) && (
            <div className="space-y-1.5 pt-2 border-t border-border/30 mt-2">
              {product.variants && product.variants.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mr-1">
                    Variants:
                  </span>
                  {product.variants.map((v) => (
                    <span
                      key={v}
                      className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[9px] font-bold"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              )}
              {product.capacities && product.capacities.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mr-1">
                    Specs:
                  </span>
                  {product.capacities.map((c) => (
                    <span
                      key={c.name}
                      className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricing Segment */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-muted-foreground">
              Unit Cost
            </span>
            <span className="text-xl font-black text-foreground">
              {formatNaira(product.unit_price)}
            </span>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-[10px] font-black uppercase text-muted-foreground">
              Stock Level
            </span>
            <span
              className={`text-lg font-black ${isOutOfStock ? "text-red-500" : isLowStock ? "text-orange-500" : "text-emerald-500"}`}
            >
              {stockCount} <span className="text-[10px] uppercase">units</span>
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${isOutOfStock ? "bg-red-500" : isLowStock ? "bg-orange-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min((stockCount / 20) * 100, 100)}%` }}
          />
        </div>

        {/* Actions section */}
        <div className="flex gap-2 mt-4 pt-2 border-t border-border/30">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              viewProductDetails();
            }}
            variant="outline"
            className="flex-1 rounded-xl py-2 h-10 font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer text-xs"
          >
            <Eye size={14} />
            View Info
          </Button>
          {(!!user?.permissions?.is_staff || !!user?.permissions?.store_role) && (
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isOutOfStock) {
                  toast.error("Product is out of stock!");
                  return;
                }
                addToCart(product);
                toast.success("Added to Cart", {
                  description: `"${product.name}" added to terminal cart successfully.`,
                });
              }}
              disabled={isOutOfStock}
              className="flex-1 rounded-xl py-2 h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer text-xs"
            >
              <ShoppingCart size={14} />
              Add to Cart
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-lg p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to purge{" "}
              <span className="font-bold text-foreground">
                "{product.name}"
              </span>{" "}
              from the database? This will permanently erase all associated
              records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel
              disabled={isLoading}
              className="rounded-lg h-12 font-bold px-6"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 text-white hover:bg-red-700 rounded-lg h-12 font-black px-6"
            >
              {isLoading ? "Purging..." : "Confirm Purge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductCard;
