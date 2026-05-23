"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ShieldCheck,
  HelpCircle,
  Package,
  TrendingUp,
  Users,
  Bell,
  ChevronRight,
  Laptop,
  Mail,
  Building2,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { apiService } from "@/lib/services/apiService";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "getting-started", title: "Getting Started", icon: BookOpen },
  { id: "how-to-use", title: "How to Use", icon: HelpCircle },
  { id: "terms", title: "Terms of Use", icon: ShieldCheck },
  { id: "register-app", title: "Get the App", icon: Laptop },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  // Registration Form States
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("general");
  const [adminEmail, setAdminEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const response: any = await apiService.post("/tenants/register/", {
        business_name: businessName,
        business_type: businessType,
        admin_email: adminEmail,
        first_name: firstName,
        last_name: lastName,
      });

      setStatusMsg({
        type: "success",
        text: response.message || "Registration received successfully!",
      });

      // Clear form
      setBusinessName("");
      setAdminEmail("");
      setFirstName("");
      setLastName("");
      setBusinessType("general");
    } catch (err: any) {
      const errorText =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setStatusMsg({
        type: "error",
        text: errorText,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Complete guide, terms of use, and software manual.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Docs Navigation */}
        <div className="w-full lg:w-64 shrink-0 bg-card/50 border border-border/50 rounded-lg p-4 sticky top-24">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-accent/50 text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-bold text-sm tracking-tight">
                    {section.title}
                  </span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card/30 border border-border/50 rounded-lg p-6 lg:p-10 shadow-sm min-h-[500px]">
          {activeSection === "getting-started" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Getting Started
                </h2>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to <strong>Quantum Stack</strong>, your complete
                  solution for managing stock, tracking product lifecycles, and
                  empowering your staff with the tools they need to maintain
                  efficient operations.
                </p>
                <div className="p-4 bg-accent/30 rounded-lg border border-border/50 mt-6">
                  <h3 className="font-bold mb-2">System Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Our platform is designed around a unified dashboard,
                    enabling seamless product entry, category management, and
                    automated alerts for critical stock or expiring lots. It
                    operates completely in real-time, providing deep insights at
                    a glance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "how-to-use" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <HelpCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  How to Use This Software
                </h2>
              </div>

              <div className="grid gap-6">
                <div className="group p-5 bg-card border border-border/50 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Package size={18} />
                    </div>
                    <h3 className="font-bold text-lg">Managing Products</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Navigate to the <strong>Products</strong> module via the
                    sidebar to view your current inventory. You can add new
                    stock, edit existing items, and specify tracking metrics
                    such as SKU, pricing, and quantities. Use the filters to
                    quickly find what you are looking for.
                  </p>
                </div>

                <div className="group p-5 bg-card border border-border/50 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                      <TrendingUp size={18} />
                    </div>
                    <h3 className="font-bold text-lg">
                      Organizing by Categories
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The <strong>Categories</strong> section allows you to
                    logically group products. Proper categorization simplifies
                    searching and provides better analytics on the dashboard
                    regarding which segments of your inventory are performing
                    best.
                  </p>
                </div>

                <div className="group p-5 bg-card border border-border/50 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                      <Bell size={18} />
                    </div>
                    <h3 className="font-bold text-lg">
                      Critical Stock & Expiries
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Under <strong>Stock Operations</strong>, you can quickly
                    monitor <em>Critical Stock</em> (items running low) and{" "}
                    <em>Expiring Lots</em>. The system automatically tracks days
                    until expiry and alerts you, reducing waste and preventing
                    stockouts.
                  </p>
                </div>

                <div className="group p-5 bg-card border border-border/50 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Users size={18} />
                    </div>
                    <h3 className="font-bold text-lg">Staff Management</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The <strong>Staff Management</strong> panel allows
                    administrators to add team members, assign specific roles,
                    and control their access levels across the platform. This
                    ensures secure and distributed operational management.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "terms" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Terms of Use
                </h2>
              </div>
              <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                <section>
                  <h3 className="text-foreground font-bold text-base mb-2">
                    1. Acceptance of Terms
                  </h3>
                  <p>
                    By accessing and using this software, you agree to comply
                    with and be bound by these terms of use. If you do not agree
                    with any part of these terms, please do not use the
                    platform.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold text-base mb-2">
                    2. User Responsibilities
                  </h3>
                  <p>
                    Users are responsible for maintaining the confidentiality of
                    their account credentials and for all activities that occur
                    under their account. You agree to immediately notify
                    administrators of any unauthorized use.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold text-base mb-2">
                    3. Data Accuracy
                  </h3>
                  <p>
                    While the system calculates expirations and stock metrics
                    automatically, users are responsible for the accuracy of the
                    data inputted into the system. We are not liable for
                    business losses due to incorrect data entry.
                  </p>
                </section>
                <section>
                  <h3 className="text-foreground font-bold text-base mb-2">
                    4. Service Availability
                  </h3>
                  <p>
                    We strive to ensure 99.9% uptime, but the service is
                    provided "as is". We reserve the right to modify, suspend,
                    or discontinue any part of the service at any time without
                    prior notice.
                  </p>
                </section>
              </div>
            </div>
          )}

          {activeSection === "register-app" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Laptop size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Get Quantum Stack
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Register your business profile below to request a tenant
                instance. Upon registration, your account is created in an{" "}
                <strong>inactive</strong> state. Our provisioning team will
                configure your workspace and email activation steps to your
                address.
              </p>

              {statusMsg && (
                <div
                  className={`p-4 rounded-lg border text-sm flex gap-3 items-start animate-in fade-in duration-300 ${
                    statusMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                      : "bg-destructive/10 border-destructive/20 text-destructive-foreground"
                  }`}
                >
                  {statusMsg.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <Info className="w-5 h-5 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold">
                      {statusMsg.type === "success"
                        ? "Registration Submitted"
                        : "Registration Error"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {statusMsg.text}
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleRegister}
                className="space-y-4 max-w-lg mt-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Building2 size={12} className="text-muted-foreground" />{" "}
                    Business / Store Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Pharmacy"
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                  >
                    <option value="general">General Retail</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="food_bakery">Food & Bakery</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Mail size={12} className="text-muted-foreground" /> Owner /
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. owner@acmepharmacy.com"
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg px-8 h-11 text-xs font-bold shadow-lg shadow-primary/10 w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
