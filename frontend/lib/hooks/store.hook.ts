import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StoreApi } from "../api/store.api";

// --------------------------------------
// GET STORE
// --------------------------------------
export function useGetStore() {
  return useQuery({
    queryKey: ["store"],
    queryFn: StoreApi.getStore,
    staleTime: 1000 * 60 * 5,
  });
}

// --------------------------------------
// UPDATE STORE
// --------------------------------------
export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeData: any) => StoreApi.UpdateStore(storeData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
    },
  });
};

// --------------------------------------
// UPDATE STORE STATUS
// --------------------------------------
export const useUpdateStoreStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeData: any) => StoreApi.UpdateStoreStatus(storeData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
    },
  });
};

// --------------------------------------
// UPDATE STORE LOGO
// --------------------------------------
export const useUpdateStoreLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) =>
      StoreApi.UpdateStoreLogo(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
    },
  });
};
