"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useGetProducts } from "@/lib/hooks/product.hook";
import { useCreateSale, useGetCustomers } from "@/lib/hooks/sales.hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";
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
  Tag,
} from "lucide-react";
import Image from "next/image";

type CartItem = {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  stock: number;
  sku: string;
};

export default function POSClient() {
  const {
    data: products,
    isLoading: productsLoading,
    refetch,
  } = useGetProducts();
  const createSaleMutation = useCreateSale();

  const [cart, setCart] = useState<CartItem[]>([]);
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
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const { data: customerSuggestions } = useGetCustomers(
    customerSearch.trim().length >= 1 ? customerSearch : undefined,
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

  // Add Product to Cart
  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error("Out of Stock", {
        description: `"${product.name}" is currently unavailable.`,
      });
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.warning("Limit Reached", {
            description: `Only ${product.stock} units of "${product.name}" are available in stock.`,
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          unit_price: Number(product.unit_price),
          quantity: 1,
          stock: product.stock,
          sku: product.inventory?.sku || "N/A",
        },
      ];
    });
  };

  // Remove / Decrease from Cart
  const updateQuantity = (itemId: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + amount;
            if (nextQty <= 0) return null;
            if (nextQty > item.stock) {
              toast.warning("Limit Reached", {
                description: `Only ${item.stock} units available in stock.`,
              });
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

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
        })),
      };

      const result = await createSaleMutation.mutateAsync(payload);
      setCompletedSale(result);
      setShowReceipt(true);
      setCart([]);
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
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-primary" />
            POS Cashier Terminal
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Scan barcodes or click products to register in-store customer sales.
          </p>
        </div>

        {/* Barcode Search Form */}
        <form
          onSubmit={handleBarcodeSubmit}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <div className="relative flex-1 md:w-72">
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode / SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-lg focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold"
            />
          </div>
          <Button
            type="submit"
            className="rounded-lg h-11 px-5 font-bold shadow-md shadow-primary/10"
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
              className="rounded-lg text-xs font-bold"
            >
              All Items
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-lg text-xs font-bold capitalize"
              >
                {cat}
              </Button>
            ))}

            {/* Keyword Search */}
            <div className="relative ml-auto w-full md:w-60 mt-2 md:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-transparent rounded-lg focus:bg-background focus:border-border transition-all text-xs font-semibold"
              />
            </div>
          </div>

          {/* Catalog Product Grid */}
          {filteredProducts.length === 0 ? (
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product: any) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const pImage =
                  product.images && product.images.length > 0
                    ? product.images[0].image
                    : "/default_product.png";

                return (
                  <Card
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`rounded-lg overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group relative ${
                      isOutOfStock
                        ? "opacity-60 bg-muted/30 pointer-events-none"
                        : ""
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-muted/40 overflow-hidden">
                      <Image
                        src={pImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      {isOutOfStock ? (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Out of Stock
                          </span>
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute top-2 left-2">
                          <span className="bg-orange-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                            Only {product.stock} left
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">
                        {product.category?.name || "Product"}
                      </p>
                      <h3 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors mt-0.5">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/30">
                        <span className="font-black text-foreground text-sm">
                          {formatNaira(product.unit_price)}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            SKU: {product.inventory?.sku || "N/A"}
                          </span>
                          <span
                            className={`text-[10px] font-black mt-0.5 ${
                              product.stock <= 5
                                ? "text-orange-500 animate-pulse"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            Stock: {product.stock} units
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side - Cart / Order Panel */}
        <div className="space-y-6">
          <Card className="rounded-xl border-primary/10 shadow-xl shadow-primary/5 overflow-hidden sticky top-6">
            <CardHeader className="p-6 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Active Receipt Cart (
                {cart.reduce((sum, i) => sum + i.quantity, 0)})
              </CardTitle>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCart([])}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg"
                >
                  Clear Cart
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {cart.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground font-bold">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Select items from the catalog or scan barcode SKU above.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Cart Items List */}
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-border/30 p-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs leading-tight text-foreground truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-muted-foreground">
                            Unit: {formatNaira(item.unit_price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 bg-muted/60 hover:bg-muted rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-bold text-xs min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 bg-muted/60 hover:bg-muted rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right min-w-[70px]">
                          <span className="font-bold text-xs text-foreground block">
                            {formatNaira(item.unit_price * item.quantity)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Customer Association Section */}
                  <div className="bg-muted/40 p-5 border-t border-border/50 space-y-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                      Customer Association
                    </span>

                    {selectedCustomer ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                            {selectedCustomer.name}
                          </p>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearch("");
                          }}
                          className="text-emerald-700 hover:text-red-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 h-8 w-8 p-0 rounded-lg"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : isAddingNewCustomer ? (
                      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                            New Customer Registration
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewCustomer(false);
                              setNewCustomerName("");
                              setNewCustomerPhone("");
                            }}
                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase">
                              Name
                            </label>
                            <input
                              type="text"
                              placeholder="Customer Name"
                              value={newCustomerName}
                              onChange={(e) =>
                                setNewCustomerName(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs font-medium focus:bg-background outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase">
                              Phone
                            </label>
                            <input
                              type="tel"
                              placeholder="Phone Number"
                              value={newCustomerPhone}
                              onChange={(e) =>
                                setNewCustomerPhone(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs font-medium focus:bg-background outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by name or phone..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        {customerSearch.trim().length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-border/50">
                            {customerSuggestions &&
                            customerSuggestions.length > 0 ? (
                              customerSuggestions.map((c: any) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setCustomerSearch("");
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted font-semibold transition-colors flex justify-between items-center"
                                >
                                  <span className="text-foreground">
                                    {c.name}
                                  </span>
                                  <span className="text-muted-foreground text-[10px] font-bold">
                                    {c.phone}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2.5 text-xs text-muted-foreground">
                                No matches found.
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingNewCustomer(true);
                                setNewCustomerName(customerSearch);
                                setNewCustomerPhone("");
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-primary/5 text-primary font-bold transition-colors border-t border-border"
                            >
                              + Register "{customerSearch}"
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Calculations & Discounts */}
                  <div className="bg-muted/30 p-6 border-t border-border/50 space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                          Discount (₦)
                        </label>
                        <input
                          type="number"
                          placeholder="₦ 0.00"
                          value={discount || ""}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                          Tax (₦)
                        </label>
                        <input
                          type="number"
                          placeholder="₦ 0.00"
                          value={tax || ""}
                          onChange={(e) => setTax(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Pay Options */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground block mb-2">
                        Payment Method
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setPaymentMethod("cash")}
                          className={`py-2 px-3 rounded-lg border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                            paymentMethod === "cash"
                              ? "border-primary bg-primary/5 text-primary shadow-xs"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <Wallet size={14} />
                          Cash
                        </button>
                        <button
                          onClick={() => setPaymentMethod("card")}
                          className={`py-2 px-3 rounded-lg border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                            paymentMethod === "card"
                              ? "border-primary bg-primary/5 text-primary shadow-xs"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <CreditCard size={14} />
                          Card
                        </button>
                        <button
                          onClick={() => setPaymentMethod("bank_transfer")}
                          className={`py-2 px-3 rounded-lg border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                            paymentMethod === "bank_transfer"
                              ? "border-primary bg-primary/5 text-primary shadow-xs"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <Send size={14} />
                          Transfer
                        </button>
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="pt-4 border-t border-border/50 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>Cart Subtotal</span>
                        <span>{formatNaira(subtotal)}</span>
                      </div>
                      {Number(tax) > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                          <span>Tax VAT</span>
                          <span>+ {formatNaira(tax)}</span>
                        </div>
                      )}
                      {Number(discount) > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-emerald-600">
                          <span>Applied Discount</span>
                          <span>- {formatNaira(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="font-black text-sm text-foreground">
                          Grand Total
                        </span>
                        <span className="font-black text-xl text-primary">
                          {formatNaira(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleCheckout}
                      disabled={createSaleMutation.isPending}
                      className="w-full rounded-lg h-12 font-black shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {createSaleMutation.isPending
                        ? "Processing..."
                        : "Complete Checkout (Print Receipt)"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* POS Receipt Modal */}
      {showReceipt && completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-border/50">
            <div className="bg-primary/5 p-6 border-b border-border/50 text-center relative">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
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
                    {completedSale.cashier_email || "System"}
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
                <div className="max-h-[160px] overflow-y-auto divide-y divide-border/20 text-xs">
                  {completedSale.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="py-2 flex justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground block truncate">
                          {item.product_name}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {item.quantity} units @ {formatNaira(item.unit_price)}
                        </span>
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
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1 rounded-lg h-12 font-bold flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </Button>
                <Button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 rounded-lg h-12 font-black shadow-lg shadow-primary/10"
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
