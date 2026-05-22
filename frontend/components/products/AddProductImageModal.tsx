"use client";

import React, { useState } from "react";
import BaseModal from "../modals/BaseModal";
import { useToast } from "@/providers/ToastProvider";
import { useUploadProductImage } from "@/lib/hooks/product.hook";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface AddProductImageModalProps {
  productId: string;
  isModalOpen: boolean;
  closeModal: () => void;
}

const AddProductImageModal: React.FC<AddProductImageModalProps> = ({
  productId,
  isModalOpen,
  closeModal,
}) => {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadImageMutation = useUploadProductImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await uploadImageMutation.mutateAsync({ productId, formData });
      addToast({
        title: "Success",
        description: "Image uploaded successfully",
        type: "success",
      });
      setSelectedFile(null);
      setPreview(null);
      closeModal();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to upload image",
        type: "error",
      });
    }
  };

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Add Product Image"
      description="Upload a new image for this product."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 bg-muted/50">
          {preview ? (
            <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Upload size={24} />
              </div>
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG or WebP (max. 5MB)
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
        <div className="flex gap-3 pt-4 justify-end">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!selectedFile || uploadImageMutation.isPending}
          >
            {uploadImageMutation.isPending ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddProductImageModal;
