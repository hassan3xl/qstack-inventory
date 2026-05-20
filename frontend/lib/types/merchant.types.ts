import { Product } from "./product.types";
import { User } from "./user.types";

export type MerchantReviews = {
  id: string;
  avatar: string;
  user_names: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Merchant = {
  id: string;
  user: User;
  store_name: string;
  store_email: string;
  store_description: string;
  store_address: string;
  store_logo: string;
  store_phone: number;
  active_status: "active" | "inactive" | "suspended";
  verification_status: "pending" | "verified" | "rejected";
  average_rating: number;
  merchant_reviews: MerchantReviews[];
  products: Product[];
  total_sales: number;
  created_at: string;
  updated_at: string;
};
