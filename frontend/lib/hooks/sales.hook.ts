import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "../api/sales.api";
import { QUERY_KEYS } from "./queryKeys";

export const useGetSales = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SALES,
    queryFn: salesApi.getSales,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetSale = (saleId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.SALE(saleId),
    queryFn: () => salesApi.getSale(saleId),
    enabled: !!saleId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesApi.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useGetCustomers = (search?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMERS(search),
    queryFn: () => salesApi.getCustomers(search),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
