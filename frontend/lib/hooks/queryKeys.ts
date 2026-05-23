export const QUERY_KEYS = {
  // Products & Inventory
  PRODUCTS: ["products"],
  PRODUCT: (id: string) => ["product", id],
  PRODUCT_IMAGES: (id: string) => ["product-images", id],
  CATEGORIES: ["categories"],
  CATEGORY: (name: string) => ["category", name],
  INVENTORY_STATS: ["inventory-stats"],

  // Sales & POS
  SALES: ["sales"],
  SALE: (id: string) => ["sale", id],
  CUSTOMERS: (search?: string) => search ? ["customers", search] : ["customers"],
  
  // Store & Users
  STORE: ["store"],
  PROFILE: ["profile"],
  STAFF_LIST: ["staff"],
  STAFF: (id: string) => ["staff", id],

  // Notifications
  NOTIFICATIONS: ["notifications"],
  NOTIFICATION_STATS: ["notification_stats"],
} as const;
