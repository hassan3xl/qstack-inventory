"use client";

import React, { useEffect, useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import {
  useAddCategory,
  useEditCategory,
  useDeleteCategory,
  useGetCategoryDetail,
} from "@/lib/hooks/product.hook";
import { useBusinessConfig } from "@/lib/hooks/useBusinessConfig";
import { toast } from "sonner";
import { Tag, ShieldCheck, Trash2, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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

// ─── Types ──────────────────────────────────────────────────────────────────

interface CategoryFormValues {
  name: string;
  description: string;
  default_best_before_days: number;
  expiry_strategy: "GENERAL" | "PERISHABLE" | "STABLE" | "MEDICAL";
}

interface CategoryFormProps {
  isModalOpen: boolean;
  closeModal: () => void;
  /** When provided, form operates in Edit Mode using this category name. */
  categoryName?: string;
  category?: any;
}

// ─── Expiry strategy options (shared) ────────────────────────────────────────

const EXPIRY_STRATEGY_OPTIONS = [
  { value: "GENERAL", label: "General (Default)" },
  { value: "PERISHABLE", label: "Perishable (Fresh Foods)" },
  { value: "STABLE", label: "Stable (Canned, Packaged Goods)" },
  { value: "MEDICAL", label: "Medical (Drugs, Medications)" },
];

const STRATEGY_HINTS: Record<string, string> = {
  PERISHABLE: "Best for fresh produce, dairy, and meat.",
  STABLE: "Best for long-lasting packaged goods.",
  MEDICAL: "Specific tracking for pharmaceuticals.",
  GENERAL: "Standard tracking for all other items.",
};

// ─── Placeholder hints per business type ─────────────────────────────────────

const NAME_PLACEHOLDERS: Record<string, string> = {
  grocery: "e.g. Fresh Produce, Dairy & Eggs",
  pharmacy: "e.g. Antibiotics, Vitamins & Supplements",
  electronics: "e.g. Smartphones, Laptop Accessories",
  clothing: "e.g. Men's T-Shirts, Women's Footwear",
  general: "e.g. Household Items, Stationery",
  other: "e.g. Custom Category Name",
};

const DESC_PLACEHOLDERS: Record<string, string> = {
  grocery: "Describe the type of grocery items in this category...",
  pharmacy: "Describe the medications or health products here...",
  electronics: "Describe the devices or accessories in this category...",
  clothing: "Describe the clothing style, gender or age group...",
  general: "Briefly describe what items belong here...",
  other: "Briefly describe what items belong here...",
};

// ─── Component ───────────────────────────────────────────────────────────────

const CategoryForm: React.FC<CategoryFormProps> = ({
  isModalOpen,
  closeModal,
  categoryName,
  category,
}) => {
  const isEditMode = !!categoryName;
  const router = useRouter();
  const { config } = useBusinessConfig();
  const businessType = config.businessType;
  const showExpirySection = config.features.expiryTracking;

  // Hooks
  const addMutation = useAddCategory();
  const editMutation = useEditCategory();
  const deleteMutation = useDeleteCategory();
  const { data: queriedCategory, isLoading: categoryLoading } = useGetCategoryDetail(
    category ? "" : (categoryName ?? "")
  );

  const activeCategory = category || queriedCategory;
  const isLoadingActive = !category && categoryLoading;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isGlobal =
    isEditMode &&
    activeCategory &&
    (activeCategory.tenant === null || activeCategory.tenant === undefined);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      default_best_before_days: 0,
      expiry_strategy: "GENERAL",
    },
  });

  const selectedStrategy = watch("expiry_strategy");

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && activeCategory) {
      reset({
        name: activeCategory.name ?? "",
        description: activeCategory.description ?? "",
        default_best_before_days: activeCategory.default_best_before_days ?? 0,
        expiry_strategy: activeCategory.expiry_strategy ?? "GENERAL",
      });
      if (activeCategory.image) {
        setImagePreview(activeCategory.image);
      } else {
        setImagePreview(null);
      }
      setSelectedFile(null);
    }
  }, [activeCategory, isEditMode, reset]);

  // Reset on open/close for create mode
  useEffect(() => {
    if (!isModalOpen && !isEditMode) {
      reset({
        name: "",
        description: "",
        default_best_before_days: 0,
        expiry_strategy: "GENERAL",
      });
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [isModalOpen, isEditMode, reset]);

  // ── Submit handler ────────────────────────────────────────────────────────

  const onSubmit = async (data: CategoryFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append(
      "default_best_before_days",
      showExpirySection ? String(data.default_best_before_days || 0) : "0"
    );
    formData.append(
      "expiry_strategy",
      showExpirySection ? data.expiry_strategy : "GENERAL"
    );
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    if (isEditMode) {
      if (isGlobal) return;
      try {
        await editMutation.mutateAsync({ name: categoryName!, data: formData });
        toast.success("Category updated successfully!");
        closeModal();
      } catch (error: any) {
        toast.error(
          error?.name?.[0] || error?.detail || "Failed to update category."
        );
      }
    } else {
      try {
        await addMutation.mutateAsync(formData);
        toast.success("Category created successfully!");
        reset();
        closeModal();
      } catch (error: any) {
        toast.error(
          error?.name?.[0] || error?.detail || "Failed to create category."
        );
      }
    }
  };

  // ── Delete handler ────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!isEditMode || isGlobal) return;
    try {
      await deleteMutation.mutateAsync(categoryName!);
      toast.success("Category deleted successfully!");
      setShowDeleteConfirm(false);
      closeModal();
      router.push("/categories");
    } catch (error: any) {
      toast.error(
        error?.detail || error?.message || "Failed to delete category."
      );
    }
  };

  // Skip rendering modal content while edit data loads
  if (isEditMode && isLoadingActive) return null;

  const isPending = isEditMode ? editMutation.isPending : addMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          isEditMode
            ? isGlobal
              ? "View Category Rules"
              : "Edit Category"
            : `Create ${config.labels.productSingular} Category`
        }
        description={
          isEditMode
            ? isGlobal
              ? "Standard system category — read only."
              : `Update the rules for this ${config.labels.productSingular.toLowerCase()} category.`
            : `Add a new category scoped to your ${config.displayName} store.`
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Global (system) category notice */}
          {isGlobal && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex gap-3 text-xs text-blue-800 dark:text-blue-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Preset System Category</span>
                <span>
                  This category is a default preset provided by the system. It
                  cannot be modified or deleted.
                </span>
              </div>
            </div>
          )}

          {/* ── Basic Info ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
              <Tag size={16} /> Basic Information
            </h4>

            {/* Image Upload Field */}
            {!isGlobal && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Category Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/40">
                      <Upload size={16} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  )}
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">Upload a category picture</p>
                    <p>PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            )}

            <Input
              name="name"
              label="Category Name"
              register={register}
              error={errors.name}
              validation={{ required: "Category name is required" }}
              disabled={!!isGlobal}
              placeholder={
                NAME_PLACEHOLDERS[businessType] ?? "e.g. New Category"
              }
            />

            <Input
              name="description"
              label="Description"
              field="textarea"
              register={register}
              error={errors.description}
              disabled={!!isGlobal}
              placeholder={
                DESC_PLACEHOLDERS[businessType] ??
                "Briefly describe what items belong here..."
              }
              rows={3}
            />
          </div>

          {/* ── Expiry Strategy (shown only when business type supports it) ── */}
          {showExpirySection && (
            <div className="space-y-4 bg-primary/5 p-6 rounded-lg border border-primary/10">
              <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                <ShieldCheck size={16} /> Expiry Strategy
              </h4>

              <Input
                name="expiry_strategy"
                label="Strategy Type"
                field="select"
                register={register}
                error={errors.expiry_strategy}
                disabled={!!isGlobal}
                options={EXPIRY_STRATEGY_OPTIONS}
              />
              {selectedStrategy && (
                <p className="text-[10px] text-muted-foreground ml-1 font-medium">
                  {STRATEGY_HINTS[selectedStrategy]}
                </p>
              )}

              <Input
                name="default_best_before_days"
                label="Default Best Before (Days)"
                type="number"
                register={register}
                error={errors.default_best_before_days}
                disabled={!!isGlobal}
                validation={{ valueAsNumber: true }}
                placeholder="e.g. 30"
              />
              <p className="text-[10px] text-muted-foreground ml-1 font-medium">
                New products in this category will default to this shelf life.
              </p>
            </div>
          )}

          {/* ── Footer Buttons ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between items-stretch sm:items-center">
            {/* Delete — only in edit mode for tenant-owned categories */}
            <div>
              {isEditMode && !isGlobal && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg px-6 flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                >
                  <Trash2 size={16} />
                  Delete Category
                </Button>
              )}
            </div>

            <div className="flex gap-3 flex-col sm:flex-row justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg px-8 cursor-pointer"
              >
                {isGlobal ? "Close" : "Cancel"}
              </Button>
              {!isGlobal && (
                <Button
                  type="submit"
                  className="rounded-lg px-12 shadow-lg shadow-primary/20 cursor-pointer"
                  disabled={isPending}
                >
                  {isPending
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Save Changes"
                    : "Create Category"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </BaseModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-lg p-8 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              Are you sure you want to delete the category &quot;{categoryName}
              &quot;? All products inside this category must be reassigned or
              deleted first.
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 font-bold text-red-700">
                {categoryName}
              </div>
              This operation is final and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg h-12 px-6 font-bold border-border cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-12 px-6 font-black cursor-pointer"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryForm;
