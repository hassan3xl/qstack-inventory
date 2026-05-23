"use client";

import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Link from "next/link";
import { useGetProducts, useGetInventoryStats } from "@/lib/hooks/product.hook";
import { formatCurrency, formatNaira } from "@/lib/utils";
import { motion } from "framer-motion";
import Loader from "@/components/Loader";

const DashboardClient = () => {
  const { data: products, isLoading: isProductsLoading } = useGetProducts();
  const { data: invStats, isLoading: isStatsLoading } = useGetInventoryStats();

  const isLoading = isProductsLoading || isStatsLoading;

  // Calculate real metrics
  const productsArray = Array.isArray(products) ? products : [];

  const totalInventoryValue = productsArray.reduce((acc: number, p: any) => {
    return acc + (p.sale_price || 0) * (p.stock || 0);
  }, 0);

  const activeProducts = productsArray.filter((p: any) => p.is_active).length;
  const lowStockItems = productsArray.filter(
    (p: any) => p.stock > 0 && p.stock <= 5,
  );
  const outOfStockItems = productsArray.filter(
    (p: any) => p.stock === 0,
  ).length;

  // Expiring Soon Logic (within 7 days OR already expired) - only for items WITH stock
  const expiringSoon = productsArray
    .filter((p: any) => {
      if (!p.expiry_date || p.stock <= 0) return false;
      const expiryDate = new Date(p.expiry_date);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Show if expiring within 7 days OR already expired
      return diffDays <= 7;
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
    );

  const stats = [
    {
      title: "Total Products",
      value: productsArray.length.toString(),
      trend: { value: "In Database", isPositive: true },
      icon: <Package className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-500/10",
    },
    {
      title: "Active Products",
      value: activeProducts.toString(),
      trend: { value: "Live Catalog", isPositive: true },
      icon: <Package className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-500/10",
    },
    {
      title: "Low Stock Items",
      value: (invStats?.low_stock || 0).toString(),
      trend: {
        value: `${invStats?.out_of_stock || 0} out of stock`,
        isPositive: false,
      },
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-500/10",
    },
    {
      title: "Expiring Soon",
      value: (invStats?.near_expiry || 0).toString(),
      trend: { value: "Within 30 days", isPositive: false },
      icon: <Clock className="w-5 h-5 text-red-500" />,
      bg: "bg-red-500/10",
    },
  ];



  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <Header
        title="Inventory Overview"
        subtitle="Manage your products, track stock levels, and monitor expiration dates."
        actions={
          <Button
            asChild
            className="shadow-lg shadow-primary/25 rounded-lg px-6"
          >
            <Link href="/products">
              <Plus className="w-4 h-4 mr-2" />
              Manage Products
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  stat.trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                {stat.trend.value}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </p>
              <h3 className="text-lg font-black text-foreground tracking-tight">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expiring Soon Watchlist */}
        {expiringSoon && expiringSoon.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-red-500/5">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
                    <Clock className="w-5 h-5" /> Expiring Soon
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Products reaching expiration within the next 7 days
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary font-bold text-xs"
                  asChild
                >
                  <Link href="/products">View All</Link>
                </Button>
              </div>
              <div className="divide-y divide-border">
                {expiringSoon.length > 0 ? (
                  expiringSoon.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                        <Package className="w-6 h-6 text-muted-foreground group-hover:text-red-500 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Expiry:{" "}
                          {new Date(item.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {Math.ceil(
                          (new Date(item.expiry_date).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) < 0 ? (
                          <span className="text-[10px] font-black uppercase bg-red-600 text-white px-3 py-1 rounded-lg shadow-lg animate-pulse">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600">
                            {Math.ceil(
                              (new Date(item.expiry_date).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            days left
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <p>No products expiring soon.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Low Stock Watchlist */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg border border-border overflow-hidden shadow-sm"
        >
          <div className="p-6 border-b border-border bg-amber-500/5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" /> Low Stock
            </h3>
            <p className="text-xs text-muted-foreground">
              Items nearing or below threshold levels
            </p>
          </div>
          <div className="divide-y divide-border">
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 group"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.stock} units remaining
                    </p>
                  </div>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${item.stock <= 2 ? "bg-red-500" : "bg-amber-500"}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((item.stock / 5) * 100, 100)}%`,
                      }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>Stock levels look good.</p>
              </div>
            )}
          </div>
          {lowStockItems.length > 5 && (
            <div className="p-4 bg-muted/20 text-center border-t border-border">
              <Link href="/products" className="text-xs font-bold text-primary">
                View All Low Stock Items
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-linear-to-r from-primary/5 to-primary/10 p-8 rounded-lg border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Inventory Management</h4>
            <p className="text-sm text-muted-foreground">
              Physical store stock tracking and automated expiration alerts.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-lg border-primary/20 bg-background hover:bg-primary/5"
            asChild
          >
            <Link href="/inventory/products">View Full Catalog</Link>
          </Button>
          <Button
            className="rounded-lg px-8 shadow-lg shadow-primary/20"
            asChild
          >
            <Link href="/inventory/products/new">Add New Arrival</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardClient;
