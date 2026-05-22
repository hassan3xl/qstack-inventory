"use client";

import React, { useState } from "react";
import BaseModal from "../modals/BaseModal";
import { useAddCategory } from "@/lib/hooks/product.hook";
import { useToast } from "@/providers/ToastProvider";
import { Tag, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddCategoryModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isModalOpen,
  closeModal,
}) => {
  const { addToast } = useToast();
  const addCategoryMutation = useAddCategory();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_best_before_days: 0,
    expiry_strategy: "GENERAL",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "default_best_before_days" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategoryMutation.mutateAsync(formData);
      addToast({
        title: "Success",
        description: "Category created successfully!",
        type: "success",
      });
      // Reset form
      setFormData({
        name: "",
        description: "",
        default_best_before_days: 0,
        expiry_strategy: "GENERAL",
      });
      closeModal();
    } catch (error: any) {
      const errMsg =
        error?.name?.[0] || error?.detail || "Failed to create category.";
      addToast({
        title: "Error",
        description: errMsg,
        type: "error",
      });
    }
  };

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Create Custom Category"
      description="Add a new category scoped to your business."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
              <Tag size={16} /> Basic Information
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">
                Category Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Organic Produce, Cosmetics"
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                placeholder="Briefly describe what items belong here..."
              />
            </div>
          </div>

          {/* Expiry Settings */}
          <div className="space-y-4 bg-primary/5 p-6 rounded-lg border border-primary/10">
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
              <ShieldCheck size={16} /> Expiry Strategy
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">
                Strategy Type
              </label>
              <select
                name="expiry_strategy"
                value={formData.expiry_strategy}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              >
                <option value="GENERAL">General (Default)</option>
                <option value="PERISHABLE">Perishable (Fresh Foods)</option>
                <option value="STABLE">Stable (Canned, Biscuits)</option>
                <option value="MEDICAL">Medical (Drugs, Medications)</option>
              </select>
              <p className="text-[10px] text-muted-foreground ml-1 mt-1">
                {formData.expiry_strategy === "PERISHABLE" &&
                  "Best for fresh produce, dairy, and meat."}
                {formData.expiry_strategy === "STABLE" &&
                  "Best for long-lasting packaged goods."}
                {formData.expiry_strategy === "MEDICAL" &&
                  "Specific tracking for pharmaceuticals."}
                {formData.expiry_strategy === "GENERAL" &&
                  "Standard tracking for all other items."}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1 flex items-center gap-1.5">
                <Calendar size={12} /> Default Best Before (Days)
              </label>
              <input
                type="number"
                name="default_best_before_days"
                value={formData.default_best_before_days}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              <p className="text-[10px] text-muted-foreground ml-1">
                New products in this category will default to this shelf life.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-12 shadow-lg shadow-primary/20"
            disabled={addCategoryMutation.isPending}
          >
            {addCategoryMutation.isPending ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddCategoryModal;
