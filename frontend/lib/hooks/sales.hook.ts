import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "../api/sales.api";

export const useGetSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: salesApi.getSales,
  });
};

export const useGetSale = (saleId: string) => {
  return useQuery({
    queryKey: ["sale", saleId],
    queryFn: () => salesApi.getSale(saleId),
    enabled: !!saleId,
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
    },
  });
};
