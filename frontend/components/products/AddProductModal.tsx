"use client";

import React from "react";
import BaseModal from "../modals/BaseModal";
import { Button } from "@/components/ui/button";
import {
  useAddProduct,
  useGetProductsCategories,
} from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import { Package, DollarSign, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { formatPriceWithCommas, parsePriceFromFormatted } from "@/lib/utils";

interface AddProductModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  onProductAdded: () => void;
}

interface AddProductFormValues {
  name: string;
  category_id: string;
  unit_price: string;
  description: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isModalOpen,
  closeModal,
  onProductAdded,
}) => {
  const { data: categories } = useGetProductsCategories();
  const addProductMutation = useAddProduct();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    defaultValues: {
      name: "",
      category_id: "",
      unit_price: "",
      description: "",
    },
  });

  const onSubmit = async (data: AddProductFormValues) => {
    try {
      const cleanPrice = parsePriceFromFormatted(data.unit_price);
      const payload = {
        name: data.name.trim(),
        description: data.description.trim() || null,
        category_id: data.category_id,
        unit_price: cleanPrice,
        stock: 0, // Initial stock is 0; managed via batches
      };

      await addProductMutation.mutateAsync(payload);
      toast.success("Product cataloged successfully!", {
        description: "You can now receive stock batches to add inventory.",
      });
      onProductAdded();
      reset();
      closeModal();
    } catch (error) {
      toast.error("Failed to add product to catalog.");
    }
  };

  const categoryOptions =
    categories?.map((cat: any) => ({
      value: cat.id.toString(),
      label: cat.name,
    })) || [];

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Add New Catalog Item"
      description="Define product details in the system. Stock and batch tracking are logged separately when receiving inventory."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
            <Package size={14} /> Catalog Information
          </h4>

          <Input
            name="name"
            register={register}
            label="Product Name"
            icon={Package}
            placeholder="e.g. Premium Organic Milk"
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
            placeholder="Brief details about the product..."
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
                const formatted = formatPriceWithCommas(e.target.value);
                setValue("unit_price", formatted);
              },
            }}
          />
        </div>

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
