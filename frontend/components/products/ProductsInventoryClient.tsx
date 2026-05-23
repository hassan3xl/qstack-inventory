"use client";

import React, { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import AddProductModal from "@/components/products/AddProductModal";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "@/lib/hooks/product.hook";
import { Package, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

const ProductsInventoryClient: React.FC = () => {
  const { data: products, refetch } = useGetProducts();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  useEffect(() => {
    if (filterParam) {
      setStockFilter(filterParam);
    }
  }, [filterParam]);

  const categories = useMemo(() => {
    if (!products) return [];
    // Ensure products is an array
    const productsArray = Array.isArray(products) ? products : [];
    return Array.from(
      new Set(
        productsArray.map((p: any) => p.category?.name || "Uncategorized"),
      ),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const productsArray = Array.isArray(products) ? products : [];
    const q = searchTerm.trim().toLowerCase();

    return productsArray.filter((product: any) => {
      const matchesSearch =
        !q || (product.name || "").toLowerCase().includes(q);
      const matchesCategory =
        filterCategory === "all" || product.category?.name === filterCategory;

      // Stock filtering
      const stockCount = product.stock ?? 0;

      const isExpiringSoon =
        product.expiry_date &&
        !product.is_expired &&
        (new Date(product.expiry_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24) <=
          7;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stockCount > 0) ||
        (stockFilter === "low-stock" && stockCount > 0 && stockCount < 10) ||
        (stockFilter === "out-of-stock" && stockCount === 0) ||
        (stockFilter === "expiring" && isExpiringSoon);

      const matchesActive =
        activeStatusFilter === "all" ||
        (activeStatusFilter === "active" && product.is_active !== false) ||
        (activeStatusFilter === "inactive" && product.is_active === false);

      return matchesSearch && matchesCategory && matchesStock && matchesActive;
    });
  }, [products, searchTerm, filterCategory, stockFilter, activeStatusFilter]);

  const totalProducts = useMemo(
    () => (Array.isArray(products) ? products.length : 0),
    [products],
  );

  const inStock = useMemo(
    () =>
      Array.isArray(products)
        ? products.filter((p: any) => (p.stock ?? 0) > 0).length
        : 0,
    [products],
  );

  const lowStock = useMemo(
    () =>
      Array.isArray(products)
        ? products.filter((p: any) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10)
            .length
        : 0,
    [products],
  );

  const outOfStock = useMemo(
    () =>
      Array.isArray(products)
        ? products.filter((p: any) => (p.stock ?? 0) === 0).length
        : 0,
    [products],
  );

  const expiringSoonCount = useMemo(
    () =>
      Array.isArray(products)
        ? products.filter((p: any) => {
            if (!p.expiry_date || p.is_expired) return false;
            const daysLeft =
              (new Date(p.expiry_date).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24);
            return daysLeft <= 7;
          }).length
        : 0,
    [products],
  );

  const handleProductUpdate = () => {
    refetch();
  };

  if (!products) return null;

  return (
    <>
      <AddProductModal
        isModalOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        onProductAdded={handleProductUpdate}
      />
      {Array.isArray(products) && products.length === 0 ? (
        <div className="flex flex-col gap-4 justify-center items-center h-[60vh]">
          <Package className="w-16 h-16 text-muted-foreground/20" />
          <p className="text-muted-foreground font-bold italic">
            Stock database is empty.
          </p>
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="rounded-lg h-12 px-8 font-black shadow-xl shadow-primary/20"
          >
            Register First Batch
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header Section */}
          <Header
            title="System Inventory"
            subtitle="Real-time monitoring and lifecycle tracking"
            stats={[
              { title: "Catalog Size", value: `${totalProducts}` },
              { title: "In Stock", value: `${inStock}` },
              { title: "Critical Stock", value: `${lowStock}` },
              { title: "Expiring soon", value: `${expiringSoonCount}` },
            ]}
            actions={
              <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg h-12 px-6 font-black shadow-lg shadow-primary/20"
              >
                + Register Product
              </Button>
            }
          />

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-card p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Deep search by SKU, Name, or Batch ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-transparent rounded-lg focus:bg-background focus:border-primary/20 transition-all text-sm font-medium"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-muted/30 border border-transparent rounded-lg focus:bg-background focus:border-primary/20 transition-all text-sm font-bold min-w-[180px]"
            >
              <option value="all">All Classifications</option>
              {categories.map((cat: any) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-3 bg-muted/30 border border-transparent rounded-lg focus:bg-background focus:border-primary/20 transition-all text-sm font-bold min-w-[180px]"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">Available Items</option>
              <option value="low-stock">Critical Levels</option>
              <option value="out-of-stock">Depleted Stock</option>
              <option value="expiring">Expiring Soon</option>
            </select>

            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="px-4 py-3 bg-muted/30 border border-transparent rounded-lg focus:bg-background focus:border-primary/20 transition-all text-sm font-bold min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  merchantView={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-[40vh] bg-muted/5 rounded-[3rem] border border-dashed border-border">
              <p className="text-muted-foreground font-black text-sm uppercase tracking-widest">
                No matching records found in database
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductsInventoryClient;
