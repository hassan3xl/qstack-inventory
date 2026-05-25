"use client";

import React, { useEffect } from "react";
import BaseModal from "@/components/modals/BaseModal";
import { Button } from "@/components/ui/button";
import {
  useAddProduct,
  useEditProduct,
  useGetProduct,
  useGetProductsCategories,
} from "@/lib/hooks/product.hook";
import { useBusinessConfig } from "@/lib/hooks/useBusinessConfig";
import { toast } from "sonner";
import { Package, DollarSign, Info, Tag, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { formatPriceWithCommas, parsePriceFromFormatted } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProductFormValues {
  name: string;
  category_id: string;
  unit_price: string;
  description: string;
  is_active: boolean;
}

interface ProductFormProps {
  isModalOpen: boolean;
  closeModal: () => void;
  /** When provided, form operates in Edit Mode for this product ID. */
  productId?: string;
  /** Callback fired after a successful add (e.g. to trigger refetch). */
  onProductAdded?: () => void;
}

// ─── Name & description placeholders keyed by business type ─────────────────

const NAME_PLACEHOLDERS: Record<string, string> = {
  grocery:     "e.g. Organic Whole Milk 1L",
  pharmacy:    "e.g. Amoxicillin 500mg Capsules",
  electronics: "e.g. Samsung Galaxy Buds Pro",
  clothing:    "e.g. Men's Slim-Fit Chino Trousers",
  general:     "e.g. Premium Organic Milk",
  other:       "e.g. Product Name",
};

const DESC_PLACEHOLDERS: Record<string, string> = {
  grocery:     "Describe size, variant or brand details for this grocery item...",
  pharmacy:    "Describe dosage, form, or usage instructions...",
  electronics: "Describe model, specs, or included accessories...",
  clothing:    "Describe material, fit, gender or size range...",
  general:     "Brief details about the product...",
  other:       "Brief details about the product...",
};

// ─── Component ───────────────────────────────────────────────────────────────

const ProductForm: React.FC<ProductFormProps> = ({
  isModalOpen,
  closeModal,
  productId,
  onProductAdded,
}) => {
  const isEditMode = !!productId;

  const { config } = useBusinessConfig();
  const businessType = config.businessType;

  // Data hooks
  const { data: categories } = useGetProductsCategories();
  const { data: product, isLoading: productLoading } = useGetProduct(
    productId ?? ""
  );
  const addMutation = useAddProduct();
  const editMutation = useEditProduct();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      category_id: "",
      unit_price: "",
      description: "",
      is_active: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && product) {
      reset({
        name: product.name ?? "",
        category_id: product.category?.id ?? "",
        unit_price: formatPriceWithCommas(product.unit_price ?? ""),
        description: product.description ?? "",
        is_active: product.is_active ?? true,
      });
    }
  }, [product, isEditMode, reset]);

  // Reset form when create-modal closes
  useEffect(() => {
    if (!isModalOpen && !isEditMode) {
      reset({
        name: "",
        category_id: "",
        unit_price: "",
        description: "",
        is_active: true,
      });
    }
  }, [isModalOpen, isEditMode, reset]);

  // ── Submit handler ────────────────────────────────────────────────────────

  const onSubmit = async (data: ProductFormValues) => {
    const cleanPrice = parsePriceFromFormatted(data.unit_price);

    if (isEditMode) {
      try {
        await editMutation.mutateAsync({
          id: productId!,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id,
          unit_price: cleanPrice,
          is_active: data.is_active,
        });
        toast.success("Product updated successfully!");
        closeModal();
      } catch {
        toast.error("Failed to update product.");
      }
    } else {
      try {
        await addMutation.mutateAsync({
          name: data.name.trim(),
          description: data.description.trim() || null,
          category_id: data.category_id,
          unit_price: cleanPrice,
          stock: 0,
        });
        toast.success("Product cataloged successfully!", {
          description: "You can now receive stock batches to add inventory.",
        });
        onProductAdded?.();
        reset();
        closeModal();
      } catch {
        toast.error("Failed to add product to catalog.");
      }
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const categoryOptions =
    categories?.map((cat: any) => ({
      value: cat.id.toString(),
      label: cat.name,
    })) ?? [];

  const isPending = isEditMode ? editMutation.isPending : addMutation.isPending;

  const namePlaceholder =
    NAME_PLACEHOLDERS[businessType] ?? "e.g. Product Name";
  const descPlaceholder =
    DESC_PLACEHOLDERS[businessType] ?? "Brief details about the product...";

  // ── Loading state (edit mode only) ────────────────────────────────────────

  if (isEditMode && productLoading) {
    return (
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Edit Product Details"
        description="Loading product data..."
        size="sm"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground mt-4 font-semibold">
            Loading product details...
          </p>
        </div>
      </BaseModal>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={
        isEditMode
          ? `Edit ${config.labels.productSingular}`
          : `Add New ${config.labels.productSingular}`
      }
      description={
        isEditMode
          ? `Update the details for this ${config.labels.productSingular.toLowerCase()}.`
          : `Define ${config.labels.productSingular.toLowerCase()} details. Stock is managed separately via batches.`
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Core Fields ────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
            <Package size={14} /> {config.labels.sectionTitle}
          </h4>

          <Input
            name="name"
            register={register}
            label={`${config.labels.productSingular} Name`}
            icon={Package}
            placeholder={namePlaceholder}
            error={errors.name}
            validation={{ required: "Product name is required" }}
          />

          <Input
            name="category_id"
            register={register}
            label="Category"
            field="select"
            placeholder="Select Category"
            options={categoryOptions}
            error={errors.category_id}
            validation={{ required: "Category is required" }}
          />

          <Input
            name="description"
            register={register}
            label="Description (Optional)"
            field="textarea"
            icon={Info}
            placeholder={descPlaceholder}
            error={errors.description}
            rows={3}
          />

          <Input
            name="unit_price"
            register={register}
            label="Selling Price (₦)"
            icon={DollarSign}
            placeholder="0.00"
            error={errors.unit_price}
            validation={{
              required: "Selling price is required",
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setValue("unit_price", formatPriceWithCommas(e.target.value));
              },
            }}
          />
        </div>

        {/* ── Business-type custom fields (from config) ──────────────── */}
        {config.customFields.length > 0 && (
          <div className="space-y-4 bg-primary/5 p-5 rounded-lg border border-primary/10">
            <h4 className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
              <Tag size={14} /> {config.displayName} Details
            </h4>
            {config.customFields.map((field) => (
              <Input
                key={field.name}
                name={field.name as any}
                register={register}
                label={field.label}
                field={field.type === "select" ? "select" : "input"}
                type={field.type === "number" ? "number" : "text"}
                placeholder={field.placeholder}
                options={field.options}
                validation={field.required ? { required: `${field.label} is required` } : undefined}
              />
            ))}
          </div>
        )}

        {/* ── Status toggle (edit mode only) ─────────────────────────── */}
        {isEditMode && (
          <Input
            name="is_active"
            register={register}
            label="Product is Active"
            field="checkbox"
            error={errors.is_active}
          />
        )}

        {/* ── Footer Buttons ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-6 h-11 text-xs font-bold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-8 h-11 text-xs font-bold shadow-lg shadow-primary/10 cursor-pointer"
            disabled={isPending}
          >
            {isPending
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : `Add to Catalog`}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProductForm;
