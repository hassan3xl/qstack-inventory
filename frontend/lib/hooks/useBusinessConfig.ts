import { useGetStore } from "./store.hook";

export interface CustomField {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface BusinessConfig {
  businessType: string;
  displayName: string;
  themeColor: string; // Used for UI accent classes (indigo, emerald, teal, rose, etc.)
  features: {
    expiryTracking: boolean;      // Pharmacy, Grocery, General
    variantTracking: boolean;     // Clothing, Electronics
    serialNumberTracking: boolean; // Electronics
    weightUnitSupport: boolean;    // Grocery
  };
  labels: {
    productSingular: string;      // e.g. "Medication", "Apparel Item"
    productPlural: string;
    sectionTitle: string;
  };
  customFields: CustomField[];
}

const CONFIGS: Record<string, BusinessConfig> = {
  grocery: {
    businessType: "grocery",
    displayName: "Grocery Store",
    themeColor: "emerald",
    features: {
      expiryTracking: true,
      variantTracking: false,
      serialNumberTracking: false,
      weightUnitSupport: true,
    },
    labels: {
      productSingular: "Grocery Item",
      productPlural: "Grocery Items",
      sectionTitle: "Produce & Pantry Catalog",
    },
    customFields: [
      {
        name: "weight_unit",
        label: "Weight Unit",
        type: "select",
        options: [
          { value: "kg", label: "Kilograms (kg)" },
          { value: "g", label: "Grams (g)" },
          { value: "pcs", label: "Pieces (pcs)" },
          { value: "litre", label: "Litres (L)" },
        ],
        placeholder: "Select selling unit",
      },
      {
        name: "storage_condition",
        label: "Storage Condition",
        type: "select",
        options: [
          { value: "ambient", label: "Ambient (Room Temp)" },
          { value: "chilled", label: "Chilled (Refrigerated)" },
          { value: "frozen", label: "Frozen" },
        ],
      },
    ],
  },
  pharmacy: {
    businessType: "pharmacy",
    displayName: "Pharmacy & Medicine",
    themeColor: "teal",
    features: {
      expiryTracking: true,
      variantTracking: false,
      serialNumberTracking: false,
      weightUnitSupport: false,
    },
    labels: {
      productSingular: "Medication",
      productPlural: "Medications",
      sectionTitle: "Dispensary Catalog",
    },
    customFields: [
      {
        name: "dosage_form",
        label: "Dosage Form",
        type: "select",
        options: [
          { value: "tablet", label: "Tablet" },
          { value: "capsule", label: "Capsule" },
          { value: "syrup", label: "Syrup / Liquid" },
          { value: "injection", label: "Injection" },
          { value: "ointment", label: "Ointment / Cream" },
        ],
        required: true,
      },
      {
        name: "prescription_required",
        label: "Requires Prescription",
        type: "select",
        options: [
          { value: "no", label: "No (Over The Counter)" },
          { value: "yes", label: "Yes (Rx Only)" },
        ],
      },
    ],
  },
  electronics: {
    businessType: "electronics",
    displayName: "Electronics & Gadgets",
    themeColor: "indigo",
    features: {
      expiryTracking: false,
      variantTracking: true,
      serialNumberTracking: true,
      weightUnitSupport: false,
    },
    labels: {
      productSingular: "Device / Gadget",
      productPlural: "Devices & Electronics",
      sectionTitle: "Tech Device Inventory",
    },
    customFields: [
      {
        name: "brand",
        label: "Brand / Manufacturer",
        type: "text",
        placeholder: "e.g., Apple, Samsung, Sony",
        required: true,
      },
      {
        name: "warranty_months",
        label: "Warranty Period (Months)",
        type: "number",
        placeholder: "e.g., 12, 24",
      },
    ],
  },
  clothing: {
    businessType: "clothing",
    displayName: "Clothing & Apparel",
    themeColor: "rose",
    features: {
      expiryTracking: false,
      variantTracking: true,
      serialNumberTracking: false,
      weightUnitSupport: false,
    },
    labels: {
      productSingular: "Apparel Item",
      productPlural: "Clothing & Apparel",
      sectionTitle: "Fashion Catalog",
    },
    customFields: [
      {
        name: "size_category",
        label: "Size Classification",
        type: "select",
        options: [
          { value: "standard", label: "Standard (S, M, L, XL)" },
          { value: "numeric", label: "Waist / Numeric (e.g. 32, 34)" },
          { value: "shoes", label: "Shoe Sizes" },
          { value: "onesize", label: "One Size Fits All" },
        ],
      },
      {
        name: "color_theme",
        label: "Color / Style",
        type: "text",
        placeholder: "e.g., Midnight Blue, Crimson",
      },
    ],
  },
  general: {
    businessType: "general",
    displayName: "General Retail",
    themeColor: "primary",
    features: {
      expiryTracking: true,
      variantTracking: false,
      serialNumberTracking: false,
      weightUnitSupport: false,
    },
    labels: {
      productSingular: "Product",
      productPlural: "Products",
      sectionTitle: "General Stock Inventory",
    },
    customFields: [],
  },
  other: {
    businessType: "other",
    displayName: "Other",
    themeColor: "neutral",
    features: {
      expiryTracking: true,
      variantTracking: true,
      serialNumberTracking: true,
      weightUnitSupport: true,
    },
    labels: {
      productSingular: "Item",
      productPlural: "Items",
      sectionTitle: "Store Inventory",
    },
    customFields: [],
  },
};

export function useBusinessConfig() {
  const { data: storeInfo, isLoading, error } = useGetStore();
  
  const rawType = storeInfo?.business_type;
  const categoryDisplay = storeInfo?.category;
  
  let matchedConfig = CONFIGS.general;
  
  if (rawType && CONFIGS[rawType]) {
    matchedConfig = CONFIGS[rawType];
  } else if (categoryDisplay) {
    const found = Object.values(CONFIGS).find(
      c => c.displayName.toLowerCase() === categoryDisplay.toLowerCase()
    );
    if (found) {
      matchedConfig = found;
    }
  }

  return {
    config: matchedConfig,
    storeInfo,
    isLoading,
    error,
  };
}
