"use client";

import React, { useEffect, useState } from "react";
import BaseModal from "../modals/BaseModal";
import {
  useGetCategoryDetail,
  useEditCategory,
  useDeleteCategory,
} from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import {
  Tag,
  ShieldCheck,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
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

interface EditCategoryModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  categoryName: string;
}

interface EditCategoryFormValues {
  name: string;
  description: string;
  default_best_before_days: number;
  expiry_strategy: "GENERAL" | "PERISHABLE" | "STABLE" | "MEDICAL";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      default_best_before_days: 0,
      expiry_strategy: "GENERAL",
    },
  });

  const selectedStrategy = watch("expiry_strategy");

  const isGlobal =
    category && (category.tenant === null || category.tenant === undefined);

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        description: category.description || "",
        default_best_before_days: category.default_best_before_days || 0,
        expiry_strategy: category.expiry_strategy || "GENERAL",
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: EditCategoryFormValues) => {
    if (isGlobal) return;
    try {
      await editCategoryMutation.mutateAsync({
        name: categoryName,
        data: {
          ...data,
          default_best_before_days: Number(data.default_best_before_days) || 0,
        },
      });
      toast.success("Category updated successfully!");
      closeModal();
      // If renamed, redirect to new name page
      if (data.name !== categoryName) {
        router.push(`/categories/${encodeURIComponent(data.name)}`);
      }
    } catch (error: any) {
      const errMsg =
        error?.name?.[0] || error?.detail || "Failed to update category.";
      toast.error(errMsg);
    }
  };

  const handleDelete = async () => {
    if (isGlobal) return;
    try {
      await deleteCategoryMutation.mutateAsync(categoryName);
      toast.success("Category deleted successfully!");
      setShowDeleteConfirm(false);
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
    <>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <Input
                name="name"
                label="Category Name"
                register={register}
                error={errors.name}
                validation={{ required: "Category name is required" }}
                disabled={isGlobal}
                placeholder="Category Name"
              />

              <Input
                name="description"
                label="Description"
                field="textarea"
                register={register}
                error={errors.description}
                disabled={isGlobal}
                placeholder="Briefly describe what items belong here..."
                rows={3}
              />
            </div>

            {/* Expiry Settings */}
            <div className="space-y-4 bg-primary/5 p-6 rounded-lg border border-primary/10">
              <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
                <ShieldCheck size={16} /> Expiry Strategy
              </h4>

              <Input
                name="expiry_strategy"
                label="Strategy Type"
                field="select"
                register={register}
                error={errors.expiry_strategy}
                disabled={isGlobal}
                options={[
                  { value: "GENERAL", label: "General (Default)" },
                  { value: "PERISHABLE", label: "Perishable (Fresh Foods)" },
                  { value: "STABLE", label: "Stable (Canned, Biscuits)" },
                  { value: "MEDICAL", label: "Medical (Drugs, Medications)" },
                ]}
              />
              <p className="text-[10px] text-muted-foreground ml-1 mt-1 font-medium">
                {selectedStrategy === "PERISHABLE" && "Best for fresh produce, dairy, and meat."}
                {selectedStrategy === "STABLE" && "Best for long-lasting packaged goods."}
                {selectedStrategy === "MEDICAL" && "Specific tracking for pharmaceuticals."}
                {selectedStrategy === "GENERAL" && "Standard tracking for all other items."}
              </p>

              <Input
                name="default_best_before_days"
                label="Default Best Before (Days)"
                type="number"
                register={register}
                error={errors.default_best_before_days}
                disabled={isGlobal}
                validation={{ valueAsNumber: true }}
                placeholder="0"
              />
              
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between items-stretch sm:items-center">
            <div>
              {!isGlobal && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteCategoryMutation.isPending}
                  className="rounded-lg px-6 flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                >
                  <Trash2 size={16} />
                  <span>Delete Category</span>
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
                  disabled={editCategoryMutation.isPending}
                >
                  {editCategoryMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </BaseModal>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-lg p-8 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              System Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              Are you sure you want to delete the category &quot;{categoryName}&quot;? All products inside this category must be reassigned or deleted first.
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 font-bold text-red-700">
                {categoryName}
              </div>
              This operation is final and will adjust products matching this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} className="rounded-lg h-12 px-6 font-bold border-border cursor-pointer">
              Cancel Action
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

export default EditCategoryModal;
