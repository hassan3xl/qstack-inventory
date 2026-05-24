"use client";

import React, { useState } from "react";
import BaseModal from "../modals/BaseModal";
import { Button } from "@/components/ui/button";
import { useReceiveStockBatch } from "@/lib/hooks/product.hook";
import { toast } from "sonner";
import { Calendar, Layers, Hash, Clock } from "lucide-react";

interface ReceiveBatchModalProps {
  productId: string;
  productName: string;
  isModalOpen: boolean;
  closeModal: () => void;
  onBatchReceived?: () => void;
}

const ReceiveBatchModal: React.FC<ReceiveBatchModalProps> = ({
  productId,
  productName,
  isModalOpen,
  closeModal,
  onBatchReceived,
}) => {
  const receiveBatchMutation = useReceiveStockBatch();

  const [formData, setFormData] = useState({
    batch_number: "",
    quantity: "",
    production_date: "",
    expiry_date: "",
    best_before_days: "",
  });

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
    if (isNaN(qty) || qty <= 0) {
      toast.error("Invalid Input", {
        description: "Quantity must be a positive integer.",
      });
      return;
    }

    try {
      const payload = {
        batch_number: formData.batch_number.trim() || undefined,
        quantity: qty,
        production_date: formData.production_date || null,
        expiry_date: formData.expiry_date || null,
      };

      await receiveBatchMutation.mutateAsync({
        productId,
        data: payload,
      });

      toast.success("Stock batch received successfully!", {
        description: "Product inventory has been updated.",
      });

      setFormData({
        batch_number: "",
        quantity: "",
        production_date: "",
        expiry_date: "",
        best_before_days: "",
      });

      if (onBatchReceived) onBatchReceived();
      closeModal();
    } catch (error: any) {
      toast.error(error?.error || error?.detail || "Failed to receive stock batch.");
    }
  };

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Receive Stock Batch"
      description={`Log a new batch delivery for ${productName}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1 flex items-center gap-1">
              <Layers size={14} className="text-muted-foreground" />
              Quantity Received *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              placeholder="e.g. 100"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold ml-1 flex items-center gap-1">
              <Hash size={14} className="text-muted-foreground" />
              Batch/Lot Number (Optional)
            </label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              placeholder="e.g. LOT-2026-A (Auto-generated if left blank)"
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
              Expiry Date (Auto-calculated)
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
            disabled={receiveBatchMutation.isPending}
          >
            {receiveBatchMutation.isPending ? "Saving..." : "Receive Stock"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ReceiveBatchModal;
