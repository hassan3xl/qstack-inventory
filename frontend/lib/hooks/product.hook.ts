import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../api/product.api";
import { Product } from "../types/product.types";
import { useAuth } from "@/contexts/AuthContext";
import { QUERY_KEYS } from "./queryKeys";

// --------------------------------------
// GET ALL PRODUCTS
// --------------------------------------
export function useGetProducts() {
  return useQuery<Product>({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: productApi.getProducts,
    staleTime: 1000 * 60 * 5,
  });
}

// --------------------------------------
// GET INVENTORY STATS
// --------------------------------------
export function useGetInventoryStats() {
  return useQuery({
    queryKey: QUERY_KEYS.INVENTORY_STATS,
    queryFn: productApi.getInventoryStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// --------------------------------------
// GET A SINGLE PRODUCT
// --------------------------------------
export function useGetProduct(productId: string) {
  return useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => productApi.getProduct(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

// --------------------------------------
// DELETE PRODUCT IMAGE
// --------------------------------------
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => productApi.DeleteProductImage(productId, imageId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-images", variables.productId],
      });
    },
  });
};

// --------------------------------------
// UPLOAD PRODUCT IMAGE
// MUST SEND FORMDATA
// --------------------------------------
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      formData,
    }: {
      productId: string;
      formData: FormData;
    }) => productApi.AddProductImage(productId, formData),

    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-images", variables.productId],
      });
    },
  });
};

// --------------------------------------
// SET PRIMARY IMAGE
// --------------------------------------
export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => productApi.SetPrimaryImage(productId, imageId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-images", variables.productId],
      });
    },
  });
};

// --------------------------------------
// GET PRODUCT CATEGORIES
// --------------------------------------
export function useGetProductsCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: productApi.getProductsCategory,
    staleTime: 1000 * 60 * 5,
  });
}

// --------------------------------------
// GET CATEGORY DETAIL
// --------------------------------------
export function useGetCategoryDetail(name: string) {
  return useQuery({
    queryKey: ["category", name],
    queryFn: () => productApi.getCategoryDetail(name),
    enabled: !!name,
    staleTime: 1000 * 60 * 5,
  });
}

// --------------------------------------
// EDIT CATEGORY
// --------------------------------------
export const useEditCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, data }: { name: string; data: any }) =>
      productApi.EditCategory(name, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.name] });
    },
  });
};

// --------------------------------------
// ADD CATEGORY
// --------------------------------------
export const useAddCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: any) =>
      productApi.AddCategory(categoryData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// --------------------------------------
// DELETE CATEGORY
// --------------------------------------
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) =>
      productApi.DeleteCategory(name),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// --------------------------------------
// ADD PRODUCT
// --------------------------------------
export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: any) => productApi.AddProduct(productData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// --------------------------------------
// EDIT PRODUCT
// --------------------------------------
export const useEditProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: any) =>
      productApi.EditProduct(productData.id, productData),

    onSuccess: (_, productData) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productData.id] });
    },
  });
};

// --------------------------------------
// DELETE PRODUCT
// --------------------------------------
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) =>
      productApi.DeleteProduct(productId),
  });
};

// --------------------------------------
// RECEIVE STOCK BATCH
// --------------------------------------
export const useReceiveStockBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: {
        batch_number?: string;
        quantity: number;
        production_date?: string | null;
        expiry_date?: string | null;
      };
    }) => productApi.receiveStockBatch(productId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-stats"],
      });
    },
  });
};

// UPDATE STOCK BATCH
// --------------------------------------
export const useUpdateStockBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      batchId,
      data,
    }: {
      productId: string;
      batchId: string;
      data: {
        batch_number?: string;
        quantity: number;
        initial_quantity?: number;
        production_date?: string | null;
        expiry_date?: string | null;
      };
    }) => productApi.updateStockBatch(productId, batchId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-stats"],
      });
    },
  });
};

// DELETE STOCK BATCH
// --------------------------------------
export const useDeleteStockBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      batchId,
    }: {
      productId: string;
      batchId: string;
    }) => productApi.deleteStockBatch(productId, batchId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-stats"],
      });
    },
  });
};

