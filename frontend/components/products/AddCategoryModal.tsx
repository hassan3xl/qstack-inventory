"use client";

import React from "react";
import BaseModal from "../modals/BaseModal";
import { useAddCategory } from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import { Tag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface AddCategoryModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

interface AddCategoryFormValues {
  name: string;
  description: string;
  default_best_before_days: number;
  expiry_strategy: "GENERAL" | "PERISHABLE" | "STABLE" | "MEDICAL";
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isModalOpen,
  closeModal,
}) => {
  const addCategoryMutation = useAddCategory();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      default_best_before_days: 0,
      expiry_strategy: "GENERAL",
    },
  });

  const selectedStrategy = watch("expiry_strategy");

  const onSubmit = async (data: AddCategoryFormValues) => {
    try {
      await addCategoryMutation.mutateAsync({
        ...data,
        default_best_before_days: Number(data.default_best_before_days) || 0,
      });
      toast.success("Category created successfully!");
      reset();
      closeModal();
    } catch (error: any) {
      const errMsg =
        error?.name?.[0] || error?.detail || "Failed to create category.";
      toast.error(errMsg);
    }
  };

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Create Custom Category"
      description="Add a new category scoped to your business."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
              <Tag size={16} /> Basic Information
            </h4>

            <Input
              name="name"
              label="Category Name"
              register={register}
              error={errors.name}
              validation={{ required: "Category name is required" }}
              placeholder="e.g. Organic Produce, Cosmetics"
            />

            <Input
              name="description"
              label="Description"
              field="textarea"
              register={register}
              error={errors.description}
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
              validation={{ valueAsNumber: true }}
              placeholder="0"
            />
            <p className="text-[10px] text-muted-foreground ml-1 font-medium">
              New products in this category will default to this shelf life.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-8 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-12 shadow-lg shadow-primary/20 cursor-pointer"
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
