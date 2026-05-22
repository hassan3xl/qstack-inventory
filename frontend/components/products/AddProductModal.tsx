"use client";

import React, { useState } from "react";
import BaseModal from "../modals/BaseModal";
import { Button } from "@/components/ui/button";
import {
  useAddProduct,
  useGetProductsCategories,
} from "@/lib/hooks/product.hook";
import { useToast } from "@/providers/ToastProvider";
import { Package, DollarSign } from "lucide-react";

interface AddProductModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isModalOpen,
  closeModal,
  onProductAdded,
}) => {
  const { addToast } = useToast();
  const { data: categories } = useGetProductsCategories();
  const addProductMutation = useAddProduct();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    unit_price: "",
  });

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
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category_id: formData.category_id,
        unit_price: formData.unit_price,
        stock: 0, // Inital stock is 0; managed via batches
      };

      await addProductMutation.mutateAsync(payload);
      addToast({
        title: "Success",
        description:
          "Product cataloged successfully! You can now receive stock batches to add inventory.",
        type: "success",
      });
      onProductAdded();
      closeModal();
      setFormData({
        name: "",
        description: "",
        category_id: "",
        unit_price: "",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to add product to catalog.",
        type: "error",
      });
    }
  };

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Add New Catalog Item"
      description="Define product details in the system. Stock and batch tracking are logged separately when receiving inventory."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
            <Package size={14} /> Catalog Information
          </h4>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Product Name *
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
              placeholder="e.g. Premium Organic Milk"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Category *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
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
            <label className="text-xs font-semibold text-foreground">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm font-medium"
              placeholder="Brief details about the product..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <DollarSign size={14} className="text-muted-foreground" />
              Selling Price (₦) *
            </label>
            <input
              type="number"
              step="0.01"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              required
              min="0"
              placeholder="0.00"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-6 h-11 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-8 h-11 text-xs font-bold shadow-lg shadow-primary/10"
            disabled={addProductMutation.isPending}
          >
            {addProductMutation.isPending ? "Creating..." : "Add to Catalog"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddProductModal;
