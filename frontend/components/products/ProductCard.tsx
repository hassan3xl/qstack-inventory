"use client";

import { Edit, Trash2, Eye, MoreVertical, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/providers/ToastProvider";
import { apiService } from "@/lib/services/apiService";

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

const ProductCard = ({ product, merchantView = true }: ProductCardProps) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const deleteMutation = useDeleteProduct();

  const viewProductDetails = () => {
    router.push(`/products/${product.id}`);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync(product.id);

      addToast({
        title: "Product deleted",
        description: `${product.name} has been deleted successfully`,
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to delete product",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Get first image or fallback
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]?.image
      : "/makeup_product.png";



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
    <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group relative">
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
        onClick={viewProductDetails}
        className="relative cursor-pointer overflow-hidden aspect-square bg-muted/30"
      >
        <Image
          src={imageError ? "/makeup_product.png" : productImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          onError={() => setImageError(true)}
          unoptimized
        />

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
            <Eye size={20} />
          </div>
        </div>
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

        {/* Interaction Footer */}
        <div className="pt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl font-bold text-xs h-10 hover:bg-primary/5 hover:text-primary transition-all"
            onClick={viewProductDetails}
          >
            View Details
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-3xl p-8">
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
              className="rounded-2xl h-12 font-bold px-6"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 text-white hover:bg-red-700 rounded-2xl h-12 font-black px-6"
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
