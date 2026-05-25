"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import BaseModal from "../modals/BaseModal";
import { Button } from "@/components/ui/button";
import { useUpdateStockBatch } from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import { Calendar, Layers, Hash, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EditBatchModalProps {
  productId: string;
  batch: any; // The active batch object being edited
  isModalOpen: boolean;
  closeModal: () => void;
  onBatchUpdated?: () => void;
}

interface FormValues {
  quantity: string;
  initial_quantity: string;
  batch_number: string;
  production_date: string;
  best_before_days: string;
  expiry_date: string;
}

const EditBatchModal: React.FC<EditBatchModalProps> = ({
  productId,
  batch,
  isModalOpen,
  closeModal,
  onBatchUpdated,
}) => {
  const updateBatchMutation = useUpdateStockBatch();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: {
      quantity: "",
      initial_quantity: "",
      batch_number: "",
      production_date: "",
      best_before_days: "",
      expiry_date: "",
    }
  });

  const productionDate = watch("production_date");
  const bestBeforeDays = watch("best_before_days");
  const expiryDate = watch("expiry_date");

  // Populate form with current batch data on load / change
  useEffect(() => {
    if (batch) {
      const prodDateStr = batch.production_date || "";
      const expDateStr = batch.expiry_date || "";
      let diffDaysStr = "";

      if (prodDateStr && expDateStr) {
        const prod = new Date(prodDateStr);
        const exp = new Date(expDateStr);
        if (!isNaN(prod.getTime()) && !isNaN(exp.getTime())) {
          const diffTime = exp.getTime() - prod.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          diffDaysStr = diffDays >= 0 ? String(diffDays) : "0";
        }
      }

      reset({
        batch_number: batch.batch_number || "",
        quantity: String(batch.quantity ?? 0),
        initial_quantity: String(batch.initial_quantity ?? 0),
        production_date: prodDateStr,
        expiry_date: expDateStr,
        best_before_days: diffDaysStr,
      });
    }
  }, [batch, reset]);

  // Update expiry date when production date or best before days change
  useEffect(() => {
    if (productionDate && bestBeforeDays) {
      const prodDate = new Date(productionDate);
      const days = parseInt(bestBeforeDays);
      if (!isNaN(prodDate.getTime()) && !isNaN(days)) {
        const expDate = new Date(prodDate.getTime() + days * 24 * 60 * 60 * 1000);
        const expDateStr = expDate.toISOString().split("T")[0];
        if (expiryDate !== expDateStr) {
          setValue("expiry_date", expDateStr);
        }
      }
    }
  }, [productionDate, bestBeforeDays, setValue, expiryDate]);

  // Update best before days when expiry date or production date change
  useEffect(() => {
    if (productionDate && expiryDate) {
      const prodDate = new Date(productionDate);
      const expDate = new Date(expiryDate);
      if (!isNaN(prodDate.getTime()) && !isNaN(expDate.getTime())) {
        const diffTime = expDate.getTime() - prodDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffDaysStr = diffDays >= 0 ? String(diffDays) : "0";
        if (bestBeforeDays !== diffDaysStr) {
          setValue("best_before_days", diffDaysStr);
        }
      }
    }
  }, [productionDate, expiryDate, setValue, bestBeforeDays]);

  const onSubmit = async (data: FormValues) => {
    const qty = parseInt(data.quantity);
    const initialQty = parseInt(data.initial_quantity);

    if (isNaN(qty) || qty < 0) {
      toast.error("Invalid Input", {
        description: "Quantity must be a non-negative integer.",
      });
      return;
    }

    try {
      const payload = {
        batch_number: data.batch_number.trim(),
        quantity: qty,
        initial_quantity: isNaN(initialQty) ? qty : initialQty,
        production_date: data.production_date || null,
        expiry_date: data.expiry_date || null,
      };

      await updateBatchMutation.mutateAsync({
        productId,
        batchId: batch.id,
        data: payload,
      });

      toast.success("Stock batch updated successfully!");

      if (onBatchUpdated) onBatchUpdated();
      closeModal();
    } catch (error: any) {
      toast.error(error?.error || error?.detail || "Failed to update stock batch.");
    }
  };

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Modify Stock Batch"
      description={`Edit FEFO details for batch ${batch?.batch_number}.`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="quantity"
              register={register}
              label="Remaining Quantity"
              type="number"
              icon={Layers}
              placeholder="e.g. 50"
              error={errors.quantity}
              validation={{ 
                required: "Remaining quantity is required",
                min: { value: 0, message: "Quantity cannot be negative" }
              }}
            />

            <Input
              name="initial_quantity"
              register={register}
              label="Initial Quantity"
              type="number"
              icon={Layers}
              placeholder="e.g. 100"
              error={errors.initial_quantity}
              validation={{ 
                required: "Initial quantity is required",
                min: { value: 0, message: "Quantity cannot be negative" }
              }}
            />
          </div>

          <Input
            name="batch_number"
            register={register}
            label="Batch/Lot Number"
            type="text"
            icon={Hash}
            error={errors.batch_number}
            validation={{ required: "Batch/Lot number is required" }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="production_date"
              register={register}
              label="Production Date"
              type="date"
              icon={Calendar}
              error={errors.production_date}
            />

            <Input
              name="best_before_days"
              register={register}
              label="Best Before (Days)"
              type="number"
              icon={Clock}
              placeholder="e.g. 30"
              error={errors.best_before_days}
              validation={{
                min: { value: 0, message: "Value cannot be negative" }
              }}
            />
          </div>

          <Input
            name="expiry_date"
            register={register}
            label="Expiry Date"
            type="date"
            icon={Calendar}
            error={errors.expiry_date}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-4 sm:px-6 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-4 sm:px-8 w-full sm:w-auto shadow-lg shadow-primary/20"
            disabled={updateBatchMutation.isPending}
          >
            {updateBatchMutation.isPending ? "Saving..." : "Update Batch"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditBatchModal;
