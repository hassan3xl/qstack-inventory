import { Merchant } from "./merchant.types";

export type Category = {
  id: string;
  name: string;
  product_count: number;
  image: string;
  description?: string;
  default_best_before_days?: number;
  expiry_strategy?: "PERISHABLE" | "STABLE" | "MEDICAL" | "GENERAL";
  created_at: string;
  updated_at: string;
};

type ProductImages = {
  id: string;
  image: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

type ProductReviews = {
  id: string;
  avatar: string;
  first_name: string;
  last_name: string;
  rating: number;
  comment: string;
  reviews: string;
  created_at: string;
};

type ProductInventory = {
  id: string;
  sku: string;
};

export type Product = {
  id: string;
  is_active: boolean;
  merchant: Merchant;
  category: Category;
  name: string;
  stock: number;
  inventory: ProductInventory;
  description: string;
  images: ProductImages[];
  unit_price: number;
  production_date?: string;
  expiry_date?: string;
  predicted_expiry_date?: string;
  best_before_days?: number;
  is_expired?: boolean;
  stock_status?: "out_of_stock" | "low" | "expiry_risk" | "ok" | "expired";
  batch_summary?: {
    total_batches: number;
    fresh: number;
    near_expiry: number;
    critical: number;
    expired: number;
    no_expiry: number;
  };
  batches?: Array<{
    id: string;
    batch_number: string;
    quantity: number;
    initial_quantity: number;
    sold_count: number;
    production_date: string | null;
    expiry_date: string | null;
    status: "fresh" | "near_expiry" | "critical" | "expired" | "no_expiry";
    days_until_expiry: number | null;
    created_at: string;
  }>;
  variants?: string[];
  capacities?: Array<{
    name: string;
    price: number | null;
  }>;
  created_at: string;
  updated_at: string;
};

