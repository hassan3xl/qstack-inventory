"use client";

import React, { useState, useEffect } from "react";
import BaseModal from "../modals/BaseModal";
import {
  useGetProduct,
  useEditProduct,
  useGetProductsCategories,
} from "@/lib/hooks/product.hook";
import { useToast } from "@/providers/ToastProvider";
import { Package, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditProductModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  productId: string;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isModalOpen,
  closeModal,
  productId,
}) => {
  const { addToast } = useToast();
  const { data: categories } = useGetProductsCategories();
  const { data: product, isLoading } = useGetProduct(productId);
  const editProductMutation = useEditProduct();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    category_id: "",
    unit_price: "",
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        category_id: product.category?.id || "",
        unit_price: product.unit_price?.toString() || "",
        is_active: product.is_active ?? true,
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanedData = {
        id: formData.id,
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id,
        unit_price: formData.unit_price,
        is_active: formData.is_active,
      };

      await editProductMutation.mutateAsync(cleanedData);
      addToast({
        title: "Success",
        description: "Product updated successfully!",
        type: "success",
      });
      closeModal();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update product.",
        type: "error",
      });
    }
  };

  if (isLoading) return null;

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Modify SKU Product Details"
      description="Update basic product information. Shelf life and stock quantities are tracked under FEFO batches."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1">Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1">
              Selling Price (Naira)
            </label>
            <input
              type="number"
              step="0.01"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              required
              placeholder="e.g. 2500"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary/20 cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">
              Product is Active
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-8 shadow-lg shadow-primary/20"
            disabled={editProductMutation.isPending}
          >
            {editProductMutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditProductModal;
