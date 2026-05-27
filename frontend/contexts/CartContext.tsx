"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type CartItem = {
  id: string;
  name: string;
  unit_price: number;
  base_unit_price: number;
  quantity: number;
  stock: number;
  sku: string;
  variants?: string[];
  selectedVariant?: string;
  capacities?: Array<{ name: string; price?: number | null }>;
  selectedCapacity?: string;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  updateQuantity: (itemId: string, amount: number) => void;
  updateVariant: (itemId: string, variant: string) => void;
  updateCapacity: (itemId: string, capacity: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qstack_cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("qstack_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (product: any) => {
    const stock = product.stock ?? 0;
    if (stock <= 0) {
      toast.error("Out of Stock", {
        description: `"${product.name}" is currently unavailable.`,
      });
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= stock) {
          toast.warning("Limit Reached", {
            description: `Only ${stock} units of "${product.name}" are available in stock.`,
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const capacities = product.capacities || [];
      const selectedCapacity = capacities.length > 0 ? capacities[0].name : undefined;
      const initialCapacityObj = capacities.find((c: any) => c.name === selectedCapacity);
      const base_unit_price = Number(product.unit_price);
      const unit_price = (initialCapacityObj && initialCapacityObj.price) 
        ? Number(initialCapacityObj.price) 
        : base_unit_price;

      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          unit_price,
          base_unit_price,
          quantity: 1,
          stock,
          sku: product.inventory?.sku || "N/A",
          variants: product.variants || [],
          selectedVariant: product.variants && product.variants.length > 0 ? product.variants[0] : undefined,
          capacities,
          selectedCapacity,
        },
      ];
    });
  };

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

  const updateVariant = (itemId: string, variant: string) => {
    setCart((prevCart) => {
      return prevCart.map((item) =>
        item.id === itemId ? { ...item, selectedVariant: variant } : item
      );
    });
  };

  const updateCapacity = (itemId: string, capacity: string) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === itemId) {
          const capObj = item.capacities?.find((c) => c.name === capacity);
          const unit_price = (capObj && capObj.price) ? Number(capObj.price) : item.base_unit_price;
          return {
            ...item,
            selectedCapacity: capacity,
            unit_price
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        updateVariant,
        updateCapacity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
