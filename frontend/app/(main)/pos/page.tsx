"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useGetProducts } from "@/lib/hooks/product.hook";
import { useCreateSale, useGetCustomers } from "@/lib/hooks/sales.hook";
import { useGetStore } from "@/lib/hooks/store.hook";
import { useBusinessConfig } from "@/lib/hooks/useBusinessConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductCard from "@/components/products/ProductCard";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";
import { NormalInput } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Wallet,
  Send,
  Barcode,
  Printer,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Loading from "@/components/Loader";

import { useCart, CartItem } from "@/contexts/CartContext";

export default function POSClient() {
  const {
    data: products,
    isLoading: productsLoading,
    refetch,
  } = useGetProducts();
  const createSaleMutation = useCreateSale();
  const { data: storeInfo } = useGetStore();
  const { config } = useBusinessConfig();

  const {
    cart,
    addToCart,
    updateQuantity,
    updateVariant,
    updateCapacity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Dialog / Receipt states
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Customer states
  const [customerSearch, setCustomerSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const { data: customerSuggestions } = useGetCustomers(
    customerSearch.trim() || undefined,
  );

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Play a beautiful barcode scanner "beep" using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = 1000; // Beep frequency
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08); // Beep duration
    } catch (e) {
      console.warn("Audio Context not supported or allowed yet", e);
    }
  };

  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Categories list
  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return Array.from(
      new Set(products.map((p: any) => p.category?.name).filter(Boolean)),
    );
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const query = searchTerm.trim().toLowerCase();
    return products.filter((p: any) => {
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        (p.inventory?.sku && p.inventory.sku.toLowerCase().includes(query));
      const matchesCategory =
        selectedCategory === "all" || p.category?.name === selectedCategory;
      return matchesSearch && matchesCategory && p.is_active;
    });
  }, [products, searchTerm, selectedCategory]);

  // Handle Simulated Barcode Scan Submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim() || !products || !Array.isArray(products)) return;

    const targetProduct = products.find(
      (p: any) =>
        p.inventory?.sku &&
        p.inventory.sku.toLowerCase() === barcodeInput.trim().toLowerCase(),
    );

    if (targetProduct) {
      playBeep();
      addToCart(targetProduct);
      toast.success("Product Scanned", {
        description: `Successfully added "${targetProduct.name}" to cart.`,
      });
      setBarcodeInput("");
    } else {
      toast.error("Not Found", {
        description: `No product matches SKU code "${barcodeInput}".`,
      });
    }
  };

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    const total = subtotal + Number(tax) - Number(discount);
    return total < 0 ? 0 : total;
  }, [subtotal, tax, discount]);

  // Submit / Process Sale Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning("Cart Empty", {
        description: "Please select at least one item to checkout.",
      });
      return;
    }

    // Validate new customer phone if new customer is being added
    if (isAddingNewCustomer && !newCustomerPhone.trim()) {
      toast.warning("Customer Phone Required", {
        description: "Please enter a phone number to save the customer.",
      });
      return;
    }

    try {
      const payload = {
        payment_method: paymentMethod,
        tax: Number(tax),
        discount: Number(discount),
        customer_id: selectedCustomer?.id || null,
        customer_name: isAddingNewCustomer ? newCustomerName : null,
        customer_phone: isAddingNewCustomer ? newCustomerPhone : null,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          variant: item.selectedVariant || null,
          capacity: item.selectedCapacity || null,
        })),
      };

      const result = await createSaleMutation.mutateAsync(payload);
      setCompletedSale(result);
      setShowReceipt(true);
      clearCart();
      setDiscount(0);
      setTax(0);

      // Reset customer states
      setSelectedCustomer(null);
      setIsAddingNewCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setCustomerSearch("");

      refetch(); // Reload products to get updated stock levels

      toast.success("Checkout Completed", {
        description: `Sale registered successfully under receipt ${result.sale_number}.`,
      });
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        "Failed to process sale";
      toast.error("Checkout Failed", {
        description: errMsg,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border/50 shadow-sm">
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-primary" />
            POS Cashier Terminal
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
            Scan barcodes or click products to register in-store customer sales.
          </p>
        </div>

        {/* Barcode Search Form */}
        <form
          onSubmit={handleBarcodeSubmit}
          className="flex hidden items-center gap-2 w-full md:w-auto"
        >
          <div className="flex-1 md:w-72">
            <NormalInput
              ref={barcodeInputRef}
              type="text"
              icon={Barcode}
              placeholder="Scan Barcode / SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="rounded-lg h-11 px-5 font-bold shadow-md shadow-primary/10 cursor-pointer"
          >
            Scan
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side - Catalog */}
        <div className="xl:col-span-2 space-y-6">
          {/* Catalog Categories & Filters */}
          <div className="bg-card p-4 rounded-lg border border-border/50 flex flex-wrap gap-2 items-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="rounded-lg text-xs font-bold cursor-pointer"
            >
              All Items
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-lg text-xs font-bold capitalize cursor-pointer"
              >
                {cat}
              </Button>
            ))}

            {/* Keyword Search */}
            <div className="ml-auto w-full md:w-60 mt-2 md:mt-0">
              <NormalInput
                type="text"
                icon={Search}
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Catalog Product Grid */}
          {productsLoading ? (
            <Loading />
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed rounded-xl">
              <Barcode className="w-16 h-16 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground font-bold">
                No products found
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Try refining your search keyword or classification filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 :grid-cols-3 gap-4">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Cart / Order Panel */}
        <div className="xl:col-span-1 space-y-4">
          <div className="sticky top-4">
            <div className="bg-card border border-border/50 rounded-xl shadow-xl shadow-black/5 overflow-hidden flex flex-col">
              {/* Cart Header */}
              <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span className="font-black text-sm">Active Cart</span>
                  {cart.length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  )}
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => clearCart()}
                    className="text-[10px] font-bold text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="font-bold text-sm text-muted-foreground">
                    Cart is empty
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    Tap any product to add it here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col min-h-0">
                  {/* ── Cart Items ────────────────── */}
                  <div className="overflow-y-auto divide-y divide-border/30 max-h-[340px] scroll-smooth">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 group hover:bg-muted/20 transition-colors"
                      >
                        {/* Item name + remove */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs leading-tight truncate text-foreground">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Unit:{" "}
                              <span className="font-semibold text-foreground">
                                {formatNaira(item.unit_price)}
                              </span>
                              {item.selectedCapacity && (
                                <span className="ml-1.5 bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                  {item.selectedCapacity}
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-muted-foreground/40 hover:text-red-500 transition-colors rounded cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Variant selector */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0">
                              Variant:
                            </span>
                            <select
                              value={item.selectedVariant || ""}
                              onChange={(e) =>
                                updateVariant(item.id, e.target.value)
                              }
                              className="flex-1 min-w-0 text-[10px] font-semibold bg-muted/40 border border-border/40 rounded-md px-2 py-1 outline-none focus:border-primary/50 focus:bg-background text-foreground cursor-pointer transition-all"
                            >
                              {item.variants.map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Capacity selector */}
                        {item.capacities && item.capacities.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0">
                              {config?.businessType === "electronics"
                                ? "Config:"
                                : "Size:"}
                            </span>
                            <select
                              value={item.selectedCapacity || ""}
                              onChange={(e) =>
                                updateCapacity(item.id, e.target.value)
                              }
                              className="flex-1 min-w-0 text-[10px] font-semibold bg-muted/40 border border-border/40 rounded-md px-2 py-1 outline-none focus:border-primary/50 focus:bg-background text-foreground cursor-pointer transition-all"
                            >
                              {item.capacities.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                  {c.price
                                    ? ` — ₦${Number(c.price).toLocaleString()}`
                                    : " (base price)"}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Qty controls + line total */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-muted/40 rounded-lg overflow-hidden border border-border/30">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer active:scale-90"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-black text-xs min-w-[28px] text-center px-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer active:scale-90"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <span className="font-black text-sm text-foreground">
                            {formatNaira(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Customer Section ─────────── */}
                  <div className="border-t border-border/40 px-4 py-4 bg-muted/20 flex-shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Customer (optional)
                    </span>

                    {selectedCustomer ? (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                            {selectedCustomer.name}
                          </p>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearch("");
                          }}
                          className="text-emerald-600 hover:text-red-500 text-xs font-bold cursor-pointer px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    ) : isAddingNewCustomer ? (
                      <div className="bg-card border border-border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-primary uppercase tracking-wider">
                            New Customer
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewCustomer(false);
                              setNewCustomerName("");
                              setNewCustomerPhone("");
                            }}
                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <NormalInput
                          type="text"
                          placeholder="Customer name"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          className="w-full text-xs"
                        />
                        <NormalInput
                          type="tel"
                          placeholder="Phone number"
                          value={newCustomerPhone}
                          onChange={(e) => setNewCustomerPhone(e.target.value)}
                          className="w-full text-xs"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <NormalInput
                          type="text"
                          icon={Search}
                          placeholder="Search or add customer…"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() =>
                            setTimeout(() => setIsSearchFocused(false), 250)
                          }
                          className="w-full text-xs"
                        />
                        {(isSearchFocused ||
                          customerSearch.trim().length > 0) && (
                          <div className="absolute left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-40 overflow-y-auto z-20 divide-y divide-border/50">
                            {customerSuggestions &&
                            customerSuggestions.length > 0 ? (
                              customerSuggestions.slice(0, 8).map((c: any) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setCustomerSearch("");
                                    setIsSearchFocused(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-semibold transition-colors flex justify-between items-center cursor-pointer"
                                >
                                  <span>{c.name}</span>
                                  <span className="text-muted-foreground text-[10px]">
                                    {c.phone}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-xs text-muted-foreground">
                                No customers found.
                              </div>
                            )}
                            {customerSearch.trim().length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingNewCustomer(true);
                                  setNewCustomerName(customerSearch);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-primary/5 text-primary font-bold transition-colors cursor-pointer"
                              >
                                + Register &quot;{customerSearch}&quot;
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Discount / Tax ────────────── */}
                  <div className="border-t border-border/40 px-4 py-4 flex-shrink-0">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <NormalInput
                        type="number"
                        label="Discount (₦)"
                        placeholder="0.00"
                        value={discount || ""}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full text-xs"
                      />
                      <NormalInput
                        type="number"
                        label="Tax (₦)"
                        placeholder="0.00"
                        value={tax || ""}
                        onChange={(e) => setTax(Number(e.target.value))}
                        className="w-full text-xs"
                      />
                    </div>

                    {/* Payment Method */}
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Payment Method
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {[
                        { key: "cash", label: "Cash", icon: Wallet },
                        { key: "card", label: "Card", icon: CreditCard },
                        { key: "bank_transfer", label: "Transfer", icon: Send },
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPaymentMethod(key)}
                          className={`py-2 px-2 rounded-lg border font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            paymentMethod === key
                              ? "border-primary bg-primary/8 text-primary shadow-sm"
                              : "border-border/50 hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon size={13} />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-semibold">
                          {formatNaira(subtotal)}
                        </span>
                      </div>
                      {Number(tax) > 0 && (
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Tax</span>
                          <span className="font-semibold">
                            + {formatNaira(tax)}
                          </span>
                        </div>
                      )}
                      {Number(discount) > 0 && (
                        <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                          <span>Discount</span>
                          <span className="font-semibold">
                            − {formatNaira(discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-border/40">
                        <span className="font-black text-sm">Total</span>
                        <span className="font-black text-xl text-primary">
                          {formatNaira(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      disabled={createSaleMutation.isPending}
                      className="w-full mt-3 rounded-xl h-12 font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {createSaleMutation.isPending
                        ? "Processing…"
                        : "Complete Checkout"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* POS Receipt Modal */}
      {showReceipt && completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:absolute print:inset-0 print:bg-white print:p-0">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-receipt, #printable-receipt * {
                visibility: visible !important;
              }
              #printable-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
              }
              .print-hide {
                display: none !important;
              }
            }
          `}</style>
          <Card
            id="printable-receipt"
            className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-border/50"
          >
            <div className="bg-primary/5 p-6 border-b border-border/50 text-center relative">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 print:hidden" />
              {storeInfo?.name && (
                <div className="text-sm font-extrabold uppercase tracking-widest text-primary mb-1">
                  {storeInfo.name}
                </div>
              )}
              <CardTitle className="text-xl font-black">
                Transaction Receipt
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Transaction logged & receipt ready for printing.
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Receipt Specs */}
              <div className="space-y-1.5 text-xs border-b border-dashed border-border pb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Receipt Number:</span>
                  <span className="font-bold text-foreground">
                    {completedSale.sale_number}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Logged Date:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(completedSale.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cashier Identity:</span>
                  <span className="font-semibold text-foreground">
                    {completedSale.cashier_name ||
                      completedSale.cashier_email ||
                      "System"}
                  </span>
                </div>
                {completedSale.customer && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Customer Details:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {completedSale.customer.name} (
                      {completedSale.customer.phone})
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Mode:</span>
                  <span className="font-bold capitalize text-primary">
                    {completedSale.payment_method.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Purchased Items
                </span>
                <div className="max-h-[160px] overflow-y-auto divide-y divide-border/20 text-xs print:max-h-none print:overflow-visible">
                  {completedSale.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="py-2 flex justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground block truncate">
                          {item.product_name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-muted-foreground text-[10px]">
                            {item.quantity} units @{" "}
                            {formatNaira(item.unit_price)}
                          </span>
                          {item.variant && (
                            <span className="bg-primary/10 text-primary text-[9px] font-black uppercase px-1 rounded-sm">
                              {item.variant}
                            </span>
                          )}
                          {item.capacity && (
                            <span className="bg-secondary/20 text-secondary-foreground text-[9px] font-black uppercase px-1 rounded-sm">
                              {item.capacity}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatNaira(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal, tax, discounts */}
              <div className="border-t border-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatNaira(completedSale.subtotal)}</span>
                </div>
                {Number(completedSale.tax) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax VAT</span>
                    <span>+ {formatNaira(completedSale.tax)}</span>
                  </div>
                )}
                {Number(completedSale.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>- {formatNaira(completedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-border font-black text-sm">
                  <span>Total Amount Paid</span>
                  <span className="text-primary text-base">
                    {formatNaira(completedSale.total_amount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 print:hidden">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1 rounded-lg h-12 font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={16} />
                  Print
                </Button>
                <Button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 rounded-lg h-12 font-black shadow-lg shadow-primary/10 cursor-pointer"
                >
                  Close Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
