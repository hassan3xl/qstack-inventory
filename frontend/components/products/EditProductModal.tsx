"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import BaseModal from "../modals/BaseModal";
import {
  useGetProduct,
  useEditProduct,
  useGetProductsCategories,
} from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import { Package, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPriceWithCommas, parsePriceFromFormatted } from "@/lib/utils";

interface EditProductModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  productId: string;
}

interface FormValues {
  name: string;
  category_id: string;
  unit_price: string;
  description: string;
  is_active: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isModalOpen,
  closeModal,
  productId,
}) => {
  const { data: categories } = useGetProductsCategories();
  const { data: product, isLoading } = useGetProduct(productId);
  const editProductMutation = useEditProduct();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      category_id: "",
      unit_price: "",
      description: "",
      is_active: true,
    }
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        category_id: product.category?.id || "",
        unit_price: formatPriceWithCommas(product.unit_price || ""),
        description: product.description || "",
        is_active: product.is_active ?? true,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const cleanPrice = parsePriceFromFormatted(data.unit_price);
      const cleanedData = {
        id: productId,
        name: data.name,
        description: data.description || null,
        category_id: data.category_id,
        unit_price: cleanPrice,
        is_active: data.is_active,
      };

      await editProductMutation.mutateAsync(cleanedData);
      toast.success("Product updated successfully!");
      closeModal();
    } catch (error) {
      toast.error("Failed to update product.");
    }
  };

  const categoryOptions = categories?.map((cat: any) => ({
    value: cat.id.toString(),
    label: cat.name,
  })) || [];

  if (isLoading) {
    return (
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Modify SKU Product Details"
        description="Update basic product information"
        size="sm"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground mt-4 font-semibold">Loading product details...</p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Modify SKU Product Details"
      description="Update basic product information"
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            name="name"
            register={register}
            label="Product Name"
            icon={Package}
            placeholder="Enter product name"
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
            name="unit_price"
            register={register}
            label="Selling Price (₦)"
            icon={DollarSign}
            placeholder="e.g. 2,500.00"
            error={errors.unit_price}
            validation={{
              required: "Selling price is required",
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const formatted = formatPriceWithCommas(e.target.value);
                setValue("unit_price", formatted);
              },
            }}
          />

          <Input
            name="description"
            register={register}
            label="Description"
            field="textarea"
            icon={Info}
            placeholder="Enter product description"
            error={errors.description}
            rows={3}
          />

          <Input
            name="is_active"
            register={register}
            label="Product is Active"
            field="checkbox"
            error={errors.is_active}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-4 sm:px-6 w-full sm:w-auto cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-4 sm:px-8 w-full sm:w-auto shadow-lg shadow-primary/20 cursor-pointer"
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
