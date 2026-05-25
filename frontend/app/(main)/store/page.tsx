"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Camera,
  ShieldCheck,
  Activity,
  CalendarDays,
  Crown,
  Edit3,
  Check,
  X,
  Bell,
  Lock,
  Tag,
  Layers,
  Cpu,
  Info,
  AlertTriangle,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetStore, useUpdateStore, useUpdateStoreLogo } from "@/lib/hooks/store.hook";
import { useBusinessConfig } from "@/lib/hooks/useBusinessConfig";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";

// ── Capability pill ──────────────────────────────────────────────────────
const CapabilityPill = ({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
      enabled
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        : "bg-muted/60 text-muted-foreground/60 border-border/40 line-through"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
    />
    {label}
  </span>
);

// ── Info row ─────────────────────────────────────────────────────────────
const InfoRow = ({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-4 py-4 border-b border-border/40 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-bold text-foreground break-all ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════
export default function StoreSettingsPage() {
  const { data: store, isLoading } = useGetStore();
  const { config } = useBusinessConfig();

  const updateStoreMutation = useUpdateStore();
  const updateLogoMutation = useUpdateStoreLogo();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [showNameWarning, setShowNameWarning] = useState(false);

  // Sync name field when store data loads
  useEffect(() => {
    if (store?.name) setNameValue(store.name);
  }, [store?.name]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus();
  }, [isEditingName]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("logo", file);
    try {
      await updateLogoMutation.mutateAsync(fd);
      toast.success("Logo updated successfully", {
        description: "Your business logo has been refreshed.",
      });
    } catch {
      toast.error("Upload failed", {
        description: "Please try a different image file.",
      });
    }
  };

  const handleNameSave = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      toast.error("Store name cannot be empty.");
      return;
    }
    if (trimmed === store?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateStoreMutation.mutateAsync({ name: trimmed });
      toast.success("Store name updated", {
        description:
          "All staff and the platform admin have been notified of this change.",
        icon: "🔔",
        duration: 5000,
      });
      setIsEditingName(false);
      setShowNameWarning(false);
    } catch {
      toast.error("Update failed", {
        description: "Could not save the new store name. Please try again.",
      });
    }
  };

  const handleNameCancel = () => {
    setNameValue(store?.name || "");
    setIsEditingName(false);
    setShowNameWarning(false);
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-muted-foreground font-semibold text-sm animate-pulse">
          Loading store profile…
        </p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Store className="w-16 h-16 text-muted-foreground/30" />
        <p className="font-bold text-foreground">Store profile not found</p>
      </div>
    );
  }

  const isDirty = nameValue.trim() !== store.name;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Top Header / Responsive Action Row ────────────────────────── */}
        <Header title="Store Profile" subtitle="Manage your business profile, details, and settings." 
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              className="flex items-center gap-2 font-bold text-xs sm:text-sm h-10 px-4 rounded-xl cursor-pointer bg-background hover:bg-muted shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={updateLogoMutation.isPending}
            >
              <Camera className="w-4 h-4 text-primary" />
              {updateLogoMutation.isPending ? "Uploading…" : "Upload Picture"}
            </Button>
            <Button
              className="flex items-center gap-2 font-bold text-xs sm:text-sm h-10 px-4 rounded-xl cursor-pointer shrink-0"
              onClick={() => setIsEditingName(true)}
              disabled={isEditingName}
            >
              <Edit3 className="w-4 h-4" />
              Rename Store
            </Button>
          </div>
        }
        />
        

      {/* Hidden file input for logo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoChange}
      />

      {/* ── Hero Banner with Logo & Editable Store Name ───────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm">
        {/* Decorative background blur blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 -mt-32 -mr-32 bg-primary/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 -mb-20 -ml-20 bg-blue-500/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">

          {/* Logo upload (Clickable overlay + hover effect) */}
          <div
            className="relative group cursor-pointer shrink-0"
            onMouseEnter={() => setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
            onClick={() => fileInputRef.current?.click()}
            title="Click to update store logo"
          >
            {/* Glow ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-background shadow-xl bg-muted flex items-center justify-center">
              {updateLogoMutation.isPending ? (
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <Image
                  src={store.logo || "/placeholder.png"}
                  alt={store.name}
                  fill
                  unoptimized
                  className={`object-cover transition-all duration-500 ${isHoveringLogo ? "scale-105 brightness-50" : "scale-100"}`}
                />
              )}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-white gap-1 transition-opacity duration-300 ${isHoveringLogo && !updateLogoMutation.isPending ? "opacity-100" : "opacity-0"}`}
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[9px] font-black uppercase tracking-wider">Change Logo</span>
              </div>
            </div>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0 text-center md:text-left pt-2">
            {/* Editable name row */}
            <div className="flex items-center gap-3 justify-center md:justify-start mb-3 flex-wrap">
              <AnimatePresence mode="wait">
                {isEditingName ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center gap-2 w-full max-w-md"
                  >
                    <input
                      ref={nameInputRef}
                      value={nameValue}
                      onChange={(e) => {
                        setNameValue(e.target.value);
                        setShowNameWarning(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave();
                        if (e.key === "Escape") handleNameCancel();
                      }}
                      className="flex-1 text-xl sm:text-2xl md:text-3xl font-black bg-background border-2 border-primary/45 focus:border-primary rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 outline-none transition-colors"
                      placeholder="Store name…"
                      maxLength={80}
                    />
                    <button
                      onClick={handleNameSave}
                      disabled={updateStoreMutation.isPending || !isDirty}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                    >
                      {updateStoreMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleNameCancel}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2.5 group/name"
                  >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
                      {store.name}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="w-8 h-8 rounded-lg bg-muted/0 hover:bg-muted text-muted-foreground/0 group-hover/name:text-muted-foreground flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0"
                      title="Edit store name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {store.is_active && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-500/20 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>

            {/* Notification warning banner when editing */}
            <AnimatePresence>
              {showNameWarning && isEditingName && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 text-amber-700 dark:text-amber-400 max-w-md text-left mx-auto md:mx-0"
                >
                  <Bell className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-relaxed">
                    Saving this will automatically notify the{" "}
                    <strong>platform administrator</strong>, <strong>store admin</strong>,
                    and all <strong>active staff members</strong>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Business type badges */}
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <Layers className="w-3 h-3" />
                {config.displayName}
              </span>
              <span className="text-xs text-muted-foreground font-semibold bg-muted/65 px-2.5 py-1 rounded-full">
                {store.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left col: store details (3/5) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Store info card */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-black text-xs uppercase tracking-widest text-muted-foreground">
                Store Details
              </h2>
            </div>
            <div className="px-6">
              <InfoRow
                icon={Tag}
                label="Business Classification"
                value={store.category || "Uncategorized"}
              />
              <InfoRow
                icon={Layers}
                label="Store Type"
                value={config.displayName}
              />
              <InfoRow
                icon={Activity}
                label="Operational Status"
                value={
                  <span
                    className={store.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}
                  >
                    {store.is_active ? "Active & Operational" : "Suspended"}
                  </span>
                }
              />
              <InfoRow
                icon={CalendarDays}
                label="Platform Member Since"
                value={new Date(store.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              <InfoRow
                icon={Crown}
                label="Internal Workspace ID"
                value={store.id}
                mono
              />
            </div>
          </div>

          {/* Owner info card — locked */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-black text-xs uppercase tracking-widest text-muted-foreground">
                  Owner Account
                </h2>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/65 px-2.5 py-0.5 rounded-full">
                Read-only
              </span>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-0.5">
                    Owner Email
                  </p>
                  <p className="font-bold text-sm text-foreground truncate">
                    {store.owner_email || store.email || "—"}
                  </p>
                </div>
                <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              </div>
              <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The owner email is permanently linked to this store account and
                  cannot be changed here. Contact platform support if a transfer
                  is required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: capabilities + notification info (2/5) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Store capabilities */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-black text-xs uppercase tracking-widest text-muted-foreground">
                Store Capabilities
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                Active features configuration:
              </p>
              <div className="flex flex-wrap gap-2">
                <CapabilityPill
                  label="Expiry Tracking"
                  enabled={config.features.expiryTracking}
                />
                <CapabilityPill
                  label="Variant Tracking"
                  enabled={config.features.variantTracking}
                />
                <CapabilityPill
                  label="Serial Numbers"
                  enabled={config.features.serialNumberTracking}
                />
                <CapabilityPill
                  label="Weight Units"
                  enabled={config.features.weightUnitSupport}
                />
              </div>
              {config.customFields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                    Custom Fields
                  </p>
                  <div className="space-y-1">
                    {config.customFields.map((f) => (
                      <div
                        key={f.name}
                        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                        {f.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification info card */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-500/15 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="font-black text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Name Change Alerts
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                When the store name is updated, notifications will be sent directly to:
              </p>
              <ul className="space-y-2">
                {[
                  "Platform Administrator",
                  "Store Owner / Admin account",
                  "All active staff members",
                ].map((r) => (
                  <li
                    key={r}
                    className="flex items-center gap-2.5 text-xs font-bold text-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Bell className="w-3 h-3" />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
              <div className="flex items-start gap-2 pt-2 border-t border-amber-500/10">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-normal">
                  All updates are audited. Avoid frequent modifications to prevent disruption or confusion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
