"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import BaseModal from "./BaseModal";
import { Input } from "../ui/input";
import { Building, MapPin, Phone } from "lucide-react";
import { useGetStore, useUpdateStore } from "@/lib/hooks/store.hook";

interface EditStoreModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  storeId?: string;
}

type FormValues = {
  store_name: string;
  store_description: string;
  store_address: string;
  store_phone: number;
};

const EditStoreModal = ({
  isModalOpen,
  closeModal,
  storeId,
}: EditStoreModalProps) => {
  const { data: store, isLoading: loadingStore, refetch } = useGetStore();
  const { mutate: updateStore, isPending: isEditing } = useUpdateStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  // Load store data into the form
  useEffect(() => {
    if (store) {
      reset({
        store_name: store.store_name || "",
        store_description: store.store_description || "",
        store_address: store.store_address || "",
        store_phone: store.store_phone || 0,
      });
    }
  }, [store, reset]);

  const onSubmit = async (data: FormValues) => {
    const storeData = {
      id: storeId,
      store_name: data.store_name,
      store_description: data.store_description,
      store_address: data.store_address,
      store_phone: data.store_phone,
    };

    updateStore(storeData, {
      onSuccess: () => {
        refetch();
        reset();
        closeModal();
      },
      onError: (error) => {
        console.error("Failed to update store:", error);
      },
    });
  };

  if (loadingStore) {
    return (
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Edit Store"
        description="Loading store data..."
      >
        <div className="flex justify-center py-8">Loading...</div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Edit Store"
      description="Update your store details and information."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
      >
        {/* Store Basic Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Store Information</h3>
          </div>

          <div className="space-y-4">
            <Input
              name="store_name"
              register={register}
              label="Store Name"
              placeholder="Enter store name"
              error={errors.store_name}
              validation={{ required: "Store name is required" }}
            />

            <Input
              name="store_description"
              register={register}
              label="Store Description"
              field="textarea"
              placeholder="Enter store description"
              rows={3}
              error={errors.store_description}
              validation={{ required: "Store description is required" }}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <Input
              name="store_address"
              register={register}
              label="Store Address"
              placeholder="Enter store address"
              error={errors.store_address}
              validation={{ required: "Store address is required" }}
            />

            <Input
              name="store_phone"
              register={register}
              label="Phone Number"
              type="tel"
              placeholder="Enter phone number"
              error={errors.store_phone}
              validation={{
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: "Please enter a valid phone number",
                },
              }}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              closeModal();
            }}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || isEditing}
          >
            {isSubmitting || isEditing ? "Updating..." : "Update Store"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditStoreModal;
