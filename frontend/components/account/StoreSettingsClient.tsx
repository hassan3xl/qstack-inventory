"use client";

import { Button } from "@/components/ui/button";
import {
  Store,
  Upload,
  Camera,
  ShieldCheck,
  Tag,
  Hash,
  Activity,
  CalendarDays,
  Crown,
} from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useGetStore, useUpdateStoreLogo } from "@/lib/hooks/store.hook";
import { useToast } from "@/providers/ToastProvider";

const StoreSettingsClient = () => {
  const { data: store, isLoading } = useGetStore();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateLogoMutation = useUpdateStoreLogo();
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  console.log(store);
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("logo", file);

      try {
        await updateLogoMutation.mutateAsync(formData);
        addToast({
          title: "Logo Updated",
          description:
            "Your business identity has been refreshed successfully.",
          type: "success",
        });
      } catch (error) {
        addToast({
          title: "Upload Failed",
          description:
            "There was an error updating your logo. Please try again.",
          type: "error",
        });
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-semibold animate-pulse">
          Loading business identity...
        </p>
      </div>
    );

  if (!store)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Store className="w-16 h-16 text-red-500/50 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Profile Not Found</h2>
        <p className="text-muted-foreground">
          We couldn't load your store details.
        </p>
      </div>
    );

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border border-border/50 shadow-sm mb-10">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />

        <div className="relative z-10 p-10 flex flex-col md:flex-row items-center gap-8">
          {/* Interactive Logo Avatar */}
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
            onClick={handleLogoClick}
          >
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-blue-600 rounded-full blur-sm opacity-30 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-background shadow-xl bg-muted flex items-center justify-center">
              {updateLogoMutation.isPending ? (
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <Image
                  src={store?.logo || "/placeholder.png"}
                  alt="Business Logo"
                  fill
                  className={`object-cover transition-transform duration-700 ${isHoveringLogo ? "scale-110 blur-xs brightness-75" : "scale-100"}`}
                />
              )}

              {/* Hover Overlay */}
              <div
                className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white transition-opacity duration-300 ${isHoveringLogo && !updateLogoMutation.isPending ? "opacity-100" : "opacity-0"}`}
              >
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  Update
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
              <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text">
                {store.name}
              </h1>
              {store.is_active && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/20 w-fit mx-auto md:mx-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Active
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-lg font-medium max-w-xl">
              Manage your business identity, categorization, and foundational
              system parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
            Business Classification
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {store.category || "Uncategorized"}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${store.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
          >
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
            System Operational Status
          </h3>
          <p
            className={`text-2xl font-bold ${store.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
          >
            {store.is_active ? "Operational" : "Suspended"}
          </p>
        </div>

        {/* Membership Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
            Platform Member Since
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {new Date(store.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* System ID Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 w-32 h-32 translate-x-8 translate-y-8 pointer-events-none">
            <Hash className="w-full h-full" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
            Internal Workspace ID
          </h3>
          <p className="text-lg font-mono font-bold text-foreground break-all">
            {store.id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreSettingsClient;
