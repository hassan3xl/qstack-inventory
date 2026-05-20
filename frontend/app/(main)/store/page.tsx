"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/button";
import { NormalInput } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetStore, useUpdateStore } from "@/lib/hooks/store.hook";
import {
  ShieldAlert,
  Store,
  Landmark,
  Calendar,
  ShieldCheck,
} from "lucide-react";

const StoreSettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const { data: store, isLoading: isStoreLoading } = useGetStore();
  const updateStoreMutation = useUpdateStore();

  const [formData, setFormData] = useState({
    name: "",
    business_type: "",
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        business_type: store.business_type || "",
      });
    }
  }, [store]);

  const canEdit =
    user?.role === "platform_admin" ||
    user?.permissions?.is_owner ||
    user?.permissions?.is_admin ||
    user?.permissions?.is_manager;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      addToast({
        title: "Action Forbidden",
        description: "You do not have permission to modify store settings.",
        type: "error",
        duration: 4000,
      });
      return;
    }

    try {
      await updateStoreMutation.mutateAsync(formData);
      addToast({
        title: "Business Settings Saved",
        description: "Your business details have been updated successfully.",
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      addToast({
        title: "Failed to Update",
        description: err?.message || "There was an error saving store details.",
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <Header
        title="Business Account"
        subtitle="Manage store profile details, industry classification, and subdomain routing settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Store Overview Cards */}
        <div className="md:col-span-1 space-y-4">
          <Card className="rounded-[2rem] border-border/40 shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 via-card to-card">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Store className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Business Slug
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-black tracking-tight font-mono">
                {store?.subdomain || "unknown-subdomain"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Subdomain used for URL routing.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/40 shadow-sm">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                <Landmark className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {store?.category || "General Retail"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/40 shadow-sm">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Registered On
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold">
                {store?.created_at
                  ? new Date(store.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Settings Editor */}
        <div className="md:col-span-2">
          <Card className="rounded-[2rem] border-border/40 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Business Details
                {canEdit ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Admin Mode
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3 h-3" /> View Only
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Configure base business configuration options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isStoreLoading ? (
                <div className="space-y-4 py-4">
                  <div className="h-10 bg-muted rounded-2xl animate-pulse" />
                  <div className="h-10 bg-muted rounded-2xl animate-pulse" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!canEdit && (
                    <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-medium">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        Store details are read-only for your current role.
                        Please contact the owner or administrator to make edits.
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Store Name
                    </label>
                    <NormalInput
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!canEdit}
                      placeholder="Store Name"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Business Category
                    </label>
                    <select
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleChange}
                      disabled={!canEdit}
                      required
                      className="w-full bg-background border border-input rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <option value="grocery">Grocery & Provisions</option>
                      <option value="pharmacy">Pharmacy & Medicine</option>
                      <option value="electronics">Electronics & Gadgets</option>
                      <option value="clothing">Clothing & Apparel</option>
                      <option value="general">General Retail</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {canEdit && (
                    <Button
                      type="submit"
                      disabled={updateStoreMutation.isPending}
                      className="rounded-xl w-full py-6 font-bold shadow-lg shadow-primary/10"
                    >
                      {updateStoreMutation.isPending
                        ? "Saving..."
                        : "Save Business Profile"}
                    </Button>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreSettingsPage;
