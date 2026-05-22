"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

import {
  Store,
  MapPin,
  Phone,
  Calendar,
  Star,
  Users,
  Upload,
  Edit2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

import React, { useEffect, useRef, useState } from "react";
import EditStoreModal from "../modals/EditStoreModal";
import { formatDate } from "@/lib/utils";
import {
  useGetStore,
  useUpdateStoreStatus,
  useUpdateStoreLogo,
} from "@/lib/hooks/store.hook";
import { useToast } from "@/providers/ToastProvider";

const StoreSettingsClient = () => {
  const { data: store, isLoading } = useGetStore();
  const [openEditModal, setOpenEditModal] = useState(false);
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateLogoMutation = useUpdateStoreLogo();

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("logo", file);

      try {
        await updateLogoMutation.mutateAsync(formData);
        addToast({
          title: "Success",
          description: "Store logo updated successfully!",
          type: "success",
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to update store logo.",
          type: "error",
        });
      }
    }
  };

  if (isLoading)
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading business profile...
      </div>
    );
  if (!store)
    return (
      <div className="p-12 text-center text-red-500">
        Failed to load business profile.
      </div>
    );

  return (
    <div className="pb-8">
      {/* ------ HEADER ------ */}
      <Header
        title="Business Profile"
        subtitle="Manage your store's information and identity on the platform."
        stats={[
          { title: "Status", value: store.is_active ? "Active" : "Inactive" },
          { title: "Category", value: store.category },
          {
            title: "Member Since",
            value: new Date(store.created_at).toLocaleDateString(),
          },
        ]}
      />

      <div className="space-y-6">
        {/* =================== STORE INFO CARD =================== */}
        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
                <Store className="w-6 h-6 text-primary" /> Store Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Your business details as they appear on the platform
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-xs ${
                  store.is_active
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                {store.is_active ? "Active" : "Suspended"}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-6 bg-muted/30 rounded-lg border border-border">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Business Name
                </label>
                <p className="text-xl font-black">{store.name}</p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg border border-border">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Store Logo
                </label>
                <div className="flex items-center gap-4 mt-3">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border">
                    <Image
                      src={store.logo || "/placeholder.png"}
                      alt="Store Logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    onClick={handleLogoClick}
                    variant="outline"
                    className="rounded-lg shadow-sm"
                    disabled={updateLogoMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {updateLogoMutation.isPending ? "Uploading..." : "Change Logo"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-muted/30 rounded-lg border border-border">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Category
                </label>
                <p className="text-lg font-bold">{store.category}</p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg border border-border">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Internal ID
                </label>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {store.id || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Button Placeholder */}
          <div className="flex justify-end mt-8 pt-6 border-t border-border">
            <Button
              disabled
              className="rounded-lg opacity-50 cursor-not-allowed"
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit Profile (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettingsClient;
