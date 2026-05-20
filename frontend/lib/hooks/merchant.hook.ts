import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { merchantApi } from "../api/merchant.api";
import { Merchant } from "../types/merchant.types";

// --------------------------------------
// GET ALL PRODUCTS
// --------------------------------------
export function useGetMerchants() {
  return useQuery({
    queryKey: ["merchants"],
    queryFn: merchantApi.getMerchants,
  });
}

// GET A MERCHANT PROFILE
export function useGetMerchant(MerchantId: string) {
  return useQuery<Merchant>({
    queryKey: ["merchant", MerchantId],
    queryFn: () => merchantApi.getMerchant(MerchantId),
    enabled: !!MerchantId,
  });
}
