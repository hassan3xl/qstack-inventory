"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const CartButton = () => {
  const { cart } = useCart();
  const { user } = useAuth();

  // Only show the cart button if the user is authorized to sell / view POS
  const canSell = !!user?.permissions?.is_staff || !!user?.permissions?.store_role;
  if (!canSell) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link
      href="/pos"
      className="relative group rounded-xl hover:bg-accent/80 p-2 h-9 w-9 flex items-center justify-center transition-all duration-200 border border-border/50 hover:border-border"
      title="View Cashier Terminal Cart"
    >
      <ShoppingCart className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground shadow-sm animate-bounce">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
