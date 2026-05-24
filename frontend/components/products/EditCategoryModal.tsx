"use client";

import React, { useState, useEffect } from "react";
import BaseModal from "../modals/BaseModal";
import {
  useGetCategoryDetail,
  useEditCategory,
  useDeleteCategory,
} from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import {
  Info,
  Tag,
  Calendar,
  ShieldCheck,
  FileText,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { data: category, isLoading } = useGetCategoryDetail(categoryName);
  const editCategoryMutation = useEditCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_best_before_days: 0,
    expiry_strategy: "GENERAL",
  });

  const isGlobal =
    category && (category.tenant === null || category.tenant === undefined);

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
    if (isGlobal) return;
    try {
      await editCategoryMutation.mutateAsync({
        name: categoryName,
        data: formData,
      });
      toast.success("Category updated successfully!");
      closeModal();
      // If renamed, redirect to new name page
      if (formData.name !== categoryName) {
        router.push(`/categories/${encodeURIComponent(formData.name)}`);
      }
    } catch (error: any) {
      const errMsg =
        error?.name?.[0] || error?.detail || "Failed to update category.";
      toast.error(errMsg);
    }
  };

  const handleDelete = async () => {
    if (isGlobal) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${categoryName}"? All products inside this category must be reassigned or deleted first.`,
      )
    ) {
      return;
    }
    try {
      await deleteCategoryMutation.mutateAsync(categoryName);
      toast.success("Category deleted successfully!");
      closeModal();
      router.push("/categories");
    } catch (error: any) {
      const errMsg =
        error?.detail || error?.message || "Failed to delete category.";
      toast.error(errMsg);
    }
  };

  if (isLoading) return null;

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={isGlobal ? "View Category Rules" : "Edit Category"}
      description={
        isGlobal
          ? "Standard system category rules."
          : "Update category rules and default expiry settings."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {isGlobal && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex gap-3 text-xs text-blue-800 dark:text-blue-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold block">Preset System Category</span>
              <span>
                This category is a default preset provided by the system. It
                cannot be modified or deleted.
              </span>
            </div>
          </div>
        )}

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
                disabled={isGlobal}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={isGlobal}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm disabled:opacity-75 disabled:cursor-not-allowed"
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
                disabled={isGlobal}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm disabled:opacity-75 disabled:cursor-not-allowed"
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
                disabled={isGlobal}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm disabled:opacity-75 disabled:cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground ml-1">
                New products in this category will default to this shelf life.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between items-stretch sm:items-center">
          <div>
            {!isGlobal && (
              <Button
                type="button"
                // variant="destructive"
                onClick={handleDelete}
                disabled={deleteCategoryMutation.isPending}
                className="rounded-lg px-6 flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Trash2 size={16} />
                <span>Delete Category</span>
              </Button>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="rounded-lg px-8"
            >
              {isGlobal ? "Close" : "Cancel"}
            </Button>
            {!isGlobal && (
              <Button
                type="submit"
                className="rounded-lg px-12 shadow-lg shadow-primary/20"
                disabled={editCategoryMutation.isPending}
              >
                {editCategoryMutation.isPending
                  ? "Updating..."
                  : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditCategoryModal;
