"use client";

import { Edit, Package, TrendingUp, Trash2, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/Loader";
import { apiService } from "@/lib/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import {
  useDeleteProductImage,
  useGetProduct,
  useDeleteStockBatch,
} from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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
import EditProductModal from "@/components/products/EditProductModal";
import AddProductImageModal from "@/components/products/AddProductImageModal";
import ReceiveBatchModal from "@/components/products/ReceiveBatchModal";
import EditBatchModal from "@/components/products/EditBatchModal";

const ProductDetailsClient = () => {
  const { user } = useAuth();
  const permissions = user?.permissions;
  const isPlatformAdmin =
    user?.role === "platform_admin" || permissions?.is_platform_admin;
  const canModify =
    isPlatformAdmin ||
    permissions?.is_owner ||
    permissions?.is_admin ||
    permissions?.is_manager;

  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>(
    {},
  );
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const deleteBatchMutation = useDeleteStockBatch();

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string | number | null;
    name?: string;
  }>({
    open: false,
    id: null,
    name: undefined,
  });

  const [deleteBatchConfirm, setDeleteBatchConfirm] = useState<{
    open: boolean;
    id: string | null;
    batchNumber?: string;
  }>({
    open: false,
    id: null,
    batchNumber: undefined,
  });

  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
    refetch,
  } = useGetProduct(productId);

  const deleteImage = useDeleteProductImage();

  const handleDeleteImage = (imageId: string) => {
    deleteImage.mutate(
      { productId, imageId },
      {
        onSuccess: () => {
          toast.success("Image Deleted", {
            description: "The image was removed successfully.",
          });
          refetch(); // refresh product data
        },
        onError: () => {
          toast.error("Delete Failed", {
            description: "Unable to delete image. Please try again.",
          });
        },
      },
    );
  };

  const handleDeleteBatch = (batchId: string) => {
    deleteBatchMutation.mutate(
      { productId, batchId },
      {
        onSuccess: () => {
          toast.success("Batch Deleted", {
            description:
              "The batch was removed and inventory updated successfully.",
          });
          refetch();
          setDeleteBatchConfirm({ open: false, id: null });
        },
        onError: () => {
          toast.error("Delete Failed", {
            description: "Unable to delete batch. Please try again.",
          });
        },
      },
    );
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const confirmDelete = (id: string | number, name?: string) => {
    setDeleteConfirm({
      open: true,
      id,
      name,
    });
  };

  const handleViewAnalytics = () => {
    router.push(`/products/${productId}/analytics`);
  };

  const stockCount = product?.stock ?? 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;
  const isOutOfStock = stockCount === 0;
  const isActive = product?.is_active !== false;



  // Error state
  if (productError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or you don't have access.
        </p>
        <Button onClick={() => router.push("/inventory")}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Product Details</h1>
            {!isActive && (
              <Badge variant="secondary" className="bg-gray-500 text-white">
                Inactive
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="secondary" className="bg-orange-500 text-white">
                Low Stock
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="bg-red-500 text-white">
                Out of Stock
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage and monitor your product
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card>
            <CardHeader></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative mb-7 overflow-hidden rounded-lg border border-border bg-card aspect-square">
                <Image
                  src={
                    product.images?.[selectedImage]?.image &&
                    !imageErrors[selectedImage]
                      ? product.images[selectedImage].image
                      : "/default_product.png"
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(selectedImage)}
                  unoptimized
                />
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? "border-blue-600"
                            : "border-border hover:border-gray-400"
                        }`}
                      >
                        <Image
                          src={
                            img.image && !imageErrors[idx]
                              ? img.image
                              : "/default_product.png"
                          }
                          alt={`${product.name} - Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(idx)}
                          unoptimized
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Pricing & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Base Price (Unit)
                  </label>
                  <p className="text-2xl font-bold text-primary">
                    {formatNaira(product.unit_price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="font-medium">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Inventory Status
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                  <span className="font-medium text-sm">
                    {isActive ? "Regular Stock" : "Inactive / Discontinued"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expiry & Stock Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card
              className={product.is_expired ? "border-red-500 bg-red-50" : ""}
            >
              <CardHeader className="pb-3 text-red-700">
                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  Life Cycle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-black text-muted-foreground">
                    Production Date
                  </label>
                  <p className="text-sm font-bold">
                    {product.production_date
                      ? new Date(product.production_date).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-muted-foreground">
                    Expiry Date
                  </label>
                  <p
                    className={`text-sm font-black ${product.is_expired ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {product.expiry_date
                      ? new Date(product.expiry_date).toLocaleDateString()
                      : "Not set"}
                  </p>
                  {product.expiry_date && !product.is_expired && (
                    <p className="text-[10px] font-bold text-orange-600 mt-1">
                      {Math.ceil(
                        (new Date(product.expiry_date).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days until expiry
                    </p>
                  )}
                  {product.is_expired && (
                    <p className="text-[10px] font-black text-red-600 animate-pulse mt-1">
                      CRITICAL: PRODUCT EXPIRED
                    </p>
                  )}
                </div>

                {product.predicted_expiry_date && (
                  <div className="pt-2 mt-2 border-t border-red-100">
                    <label className="text-[10px] uppercase font-black text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      AI Predicted Expiry
                    </label>
                    <p className="text-sm font-black text-blue-700">
                      {new Date(
                        product.predicted_expiry_date,
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-[8px] font-bold text-blue-500 uppercase">
                      Based on AI analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wider text-primary">
                  <Package className="w-4 h-4" />
                  Stock Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black mb-1">{stockCount}</div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                  units currently available
                </p>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-muted-foreground">
                      Current Capacity
                    </span>
                    <span
                      className={
                        isLowStock ? "text-orange-600" : "text-emerald-600"
                      }
                    >
                      {isLowStock ? "Low Stock" : "Healthy"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isLowStock ? "bg-orange-500" : "bg-emerald-500"}`}
                      style={{
                        width: `${Math.min((stockCount / 20) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stock Batches Card */}
      <Card className="rounded-xl border-primary/10 shadow-xl shadow-primary/5 overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Stock Batches (FEFO Tracking)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Active product batches sorted by earliest expiry date.
            </p>
          </div>
          {canModify && (
            <Button
              onClick={() => setShowReceiveModal(true)}
              className="rounded-lg h-10 px-6 font-bold shadow-md shadow-primary/10 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Receive Stock
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {!product.batches || product.batches.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 border border-dashed rounded-lg">
              <p className="text-muted-foreground font-semibold">
                No stock batches found for this product.
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Click "Receive Stock" to log the first batch delivery.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/50 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Batch Number</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Production Date</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4">Days Left</th>
                    {canModify && (
                      <th className="px-6 py-4 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {product.batches.map((batch: any) => (
                    <tr
                      key={batch.id}
                      className="hover:bg-accent/10 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-sm tracking-tight">
                        {batch.batch_number}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black capitalize ${
                            batch.status === "fresh"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : batch.status === "near_expiry"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : batch.status === "critical"
                                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                                  : batch.status === "expired"
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse"
                                    : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {batch.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-sm">
                        {batch.quantity}{" "}
                        <span className="text-muted-foreground text-xs">
                          / {batch.initial_quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {batch.production_date
                          ? new Date(batch.production_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {batch.expiry_date
                          ? new Date(batch.expiry_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {batch.days_until_expiry !== null &&
                        batch.days_until_expiry !== undefined ? (
                          <span
                            className={
                              batch.days_until_expiry <= 7
                                ? "text-red-500 font-bold"
                                : "text-muted-foreground"
                            }
                          >
                            {batch.days_until_expiry < 0
                              ? `Expired (${Math.abs(batch.days_until_expiry)}d ago)`
                              : `${batch.days_until_expiry} days`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBatch(batch);
                              setShowEditBatchModal(true);
                            }}
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors inline-flex items-center justify-center"
                            title="Edit Batch"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteBatchConfirm({
                                open: true,
                                id: batch.id,
                                batchNumber: batch.batch_number,
                              });
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-600 transition-colors inline-flex items-center justify-center"
                            title="Delete Batch"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Management - only visible if user can modify */}
      {canModify && (
        <Card className="rounded-xl border-primary/10 shadow-xl shadow-primary/5 overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Asset & Detail Control</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Coordinate logistics and supply chain records.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowAddImageModal(true)}
                  className="flex-1 md:flex-initial rounded-lg h-14 px-8 font-black border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                >
                  Media Assets
                </Button>
                <Button
                  variant="default"
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 md:flex-initial rounded-lg h-14 px-8 font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  Modify SKU
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}

      <EditProductModal
        isModalOpen={showEditModal}
        closeModal={() => setShowEditModal(false)}
        productId={product.id}
      />
      <AddProductImageModal
        isModalOpen={showAddImageModal}
        closeModal={() => setShowAddImageModal(false)}
        productId={product.id}
      />
      <ReceiveBatchModal
        productId={product.id}
        productName={product.name}
        isModalOpen={showReceiveModal}
        closeModal={() => setShowReceiveModal(false)}
        onBatchReceived={() => refetch()}
      />
      {selectedBatch && (
        <EditBatchModal
          productId={product.id}
          batch={selectedBatch}
          isModalOpen={showEditBatchModal}
          closeModal={() => {
            setShowEditBatchModal(false);
            setSelectedBatch(null);
          }}
          onBatchUpdated={() => refetch()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ open: false, id: null })
        }
      >
        <AlertDialogContent className="rounded-lg p-8 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              System Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              You are about to remove this record from the inventory system.
              {deleteConfirm.name && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 font-bold text-red-700">
                  {deleteConfirm.name}
                </div>
              )}
              This operation is final and will be logged in the system audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-lg h-12 px-6 font-bold border-border">
              Cancel Action
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-12 px-6 font-black">
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Batch Confirmation Dialog */}
      <AlertDialog
        open={deleteBatchConfirm.open}
        onOpenChange={(open) =>
          !open && setDeleteBatchConfirm({ open: false, id: null })
        }
      >
        <AlertDialogContent className="rounded-lg p-8 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              System Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              You are about to remove this stock batch from the system.
              {deleteBatchConfirm.batchNumber && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 font-bold text-red-700">
                  Batch: {deleteBatchConfirm.batchNumber}
                </div>
              )}
              This operation is final and will adjust the total product stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-lg h-12 px-6 font-bold border-border">
              Cancel Action
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteBatchConfirm.id) {
                  handleDeleteBatch(deleteBatchConfirm.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-12 px-6 font-black"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetailsClient;
