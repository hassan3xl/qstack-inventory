import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
};

export const formatNaira = (amount: number | string) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
};

export const formatPriceWithCommas = (value: string | number) => {
  if (value === undefined || value === null) return "";
  let cleanValue = String(value).replace(/,/g, "");
  cleanValue = cleanValue.replace(/[^0-9.]/g, "");
  const parts = cleanValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  return parts.join(".");
};

export const parsePriceFromFormatted = (value: string | number) => {
  if (!value) return "";
  return String(value).replace(/,/g, "");
};
