"use client";

import React, { useState, useEffect } from "react";
import BaseModal from "../modals/BaseModal";
import { useGetCategoryDetail, useEditCategory } from "@/lib/hooks/product.hook";
import { useToast } from "@/providers/ToastProvider";
import { Info, Tag, Calendar, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditCategoryModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  categoryName: string;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isModalOpen,
  closeModal,
  categoryName,
}) => {
  const { addToast } = useToast();
  const { data: category, isLoading } = useGetCategoryDetail(categoryName);
  const editCategoryMutation = useEditCategory();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_best_before_days: 0,
    expiry_strategy: "GENERAL",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        default_best_before_days: category.default_best_before_days || 0,
        expiry_strategy: category.expiry_strategy || "GENERAL",
      });
    }
  }, [category]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "default_best_before_days" ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await editCategoryMutation.mutateAsync({
        name: categoryName,
        data: formData,
      });
      addToast({
        title: "Success",
        description: "Category updated successfully!",
        type: "success",
      });
      closeModal();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update category.",
        type: "error",
      });
    }
  };

  if (isLoading) return null;

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Edit Category"
      description="Update category rules and default expiry settings."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
              <Tag size={16} /> Basic Information
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">Category Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Briefly describe what items belong here..."
              />
            </div>
          </div>

          {/* Expiry Settings */}
          <div className="space-y-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
              <ShieldCheck size={16} /> Expiry Strategy
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">Strategy Type</label>
              <select
                name="expiry_strategy"
                value={formData.expiry_strategy}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="GENERAL">General (Default)</option>
                <option value="PERISHABLE">Perishable (Fresh Foods)</option>
                <option value="STABLE">Stable (Canned, Biscuits)</option>
                <option value="MEDICAL">Medical (Drugs, Medications)</option>
              </select>
              <p className="text-[10px] text-muted-foreground ml-1 mt-1">
                {formData.expiry_strategy === "PERISHABLE" && "Best for fresh produce, dairy, and meat."}
                {formData.expiry_strategy === "STABLE" && "Best for long-lasting packaged goods."}
                {formData.expiry_strategy === "MEDICAL" && "Specific tracking for pharmaceuticals."}
                {formData.expiry_strategy === "GENERAL" && "Standard tracking for all other items."}
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
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
            className="rounded-xl px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl px-12 shadow-lg shadow-primary/20"
            disabled={editCategoryMutation.isPending}
          >
            {editCategoryMutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditCategoryModal;
