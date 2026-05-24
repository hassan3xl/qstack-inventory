"use client";

import React, { useState, useEffect } from "react";
import BaseModal from "../modals/BaseModal";
import { Button } from "@/components/ui/button";
import { useUpdateStockBatch } from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import { Calendar, Layers, Hash, Clock } from "lucide-react";

interface EditBatchModalProps {
  productId: string;
  batch: any; // The active batch object being edited
  isModalOpen: boolean;
  closeModal: () => void;
  onBatchUpdated?: () => void;
}

const EditBatchModal: React.FC<EditBatchModalProps> = ({
  productId,
  batch,
  isModalOpen,
  closeModal,
  onBatchUpdated,
}) => {
  const updateBatchMutation = useUpdateStockBatch();

  const [formData, setFormData] = useState({
    batch_number: "",
    quantity: "",
    initial_quantity: "",
    production_date: "",
    expiry_date: "",
    best_before_days: "",
  });

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

      setFormData({
        batch_number: batch.batch_number || "",
        quantity: String(batch.quantity || 0),
        initial_quantity: String(batch.initial_quantity || 0),
        production_date: prodDateStr,
        expiry_date: expDateStr,
        best_before_days: diffDaysStr,
      });
    }
  }, [batch]);

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "production_date" || name === "best_before_days") {
        if (updated.production_date && updated.best_before_days) {
          const prodDate = new Date(updated.production_date);
          const days = parseInt(updated.best_before_days);
          if (!isNaN(prodDate.getTime()) && !isNaN(days)) {
            const expDate = new Date(
              prodDate.getTime() + days * 24 * 60 * 60 * 1000,
            );
            updated.expiry_date = expDate.toISOString().split("T")[0];
          }
        }
      } else if (name === "expiry_date") {
        if (updated.production_date && updated.expiry_date) {
          const prod = new Date(updated.production_date);
          const exp = new Date(updated.expiry_date);
          if (!isNaN(prod.getTime()) && !isNaN(exp.getTime())) {
            const diffTime = exp.getTime() - prod.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            updated.best_before_days = diffDays >= 0 ? String(diffDays) : "0";
          }
        }
      }
      return updated;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      name === "production_date" ||
      name === "expiry_date" ||
      name === "best_before_days"
    ) {
      handleDateChange(name, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(formData.quantity);
    const initialQty = parseInt(formData.initial_quantity);

    if (isNaN(qty) || qty < 0) {
      toast.error("Invalid Input", {
        description: "Quantity must be a non-negative integer.",
      });
      return;
    }

    try {
      const payload = {
        batch_number: formData.batch_number.trim(),
        quantity: qty,
        initial_quantity: isNaN(initialQty) ? qty : initialQty,
        production_date: formData.production_date || null,
        expiry_date: formData.expiry_date || null,
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
      toast.error(
        error?.error || error?.detail || "Failed to update stock batch.",
      );
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1 flex items-center gap-1">
                <Layers size={14} className="text-muted-foreground" />
                Remaining Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 50"
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1 flex items-center gap-1">
                <Layers size={14} className="text-muted-foreground" />
                Initial Quantity *
              </label>
              <input
                type="number"
                name="initial_quantity"
                value={formData.initial_quantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 100"
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1 flex items-center gap-1">
              <Hash size={14} className="text-muted-foreground" />
              Batch/Lot Number *
            </label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              required
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          {/* Dates layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1 flex items-center gap-1">
                <Calendar size={14} className="text-muted-foreground" />
                Production Date
              </label>
              <input
                type="date"
                name="production_date"
                value={formData.production_date}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1 flex items-center gap-1">
                <Clock size={14} className="text-muted-foreground" />
                Best Before (Days)
              </label>
              <input
                type="number"
                name="best_before_days"
                value={formData.best_before_days}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 30"
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1 flex items-center gap-1">
              <Calendar size={14} className="text-muted-foreground" />
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="rounded-lg px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg px-8 shadow-lg shadow-primary/20"
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
