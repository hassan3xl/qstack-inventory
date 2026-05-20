import { apiService } from "../services/apiService";

export const productApi = {
  getProducts: async () => {
    try {
      const res = await apiService.get("/inventory/products/");
      return res;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProduct: async (productId: string) => {
    try {
      const res = await apiService.get(`/inventory/products/${productId}/`);
      return res;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductWishlistStatus: async (productId: string) => {
    try {
      const res = await apiService.get(`/inventory/products/${productId}/wishlist/`);
      return res;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductsCategory: async () => {
    try {
      const res = await apiService.get("/inventory/products/categories/");
      return res;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getCategoryDetail: async (name: string) => {
    try {
      const res = await apiService.get(`/inventory/products/categories/${name}/`);
      return res;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },
  EditCategory: async (name: string, data: any) => {
    try {
      const res = await apiService.patch(
        `/inventory/products/categories/${name}/`,
        data,
      );
      return res;
    } catch (error) {
      console.error("Error editing category:", error);
      throw error;
    }
  },
  DeleteCategory: async (name: string) => {
    try {
      const res = await apiService.delete(
        `/inventory/products/categories/${name}/`,
      );
      return res;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  AddProduct: async (productData: any) => {
    try {
      const res = await apiService.post("/inventory/products/", productData);
      return res;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },
  EditProduct: async (productId: string | number, data: FormData | any) => {
    const res = await apiService.patch(
      `/inventory/products/${productId}/`,
      data,
    );
    return res.data;
  },

  DeleteProduct: async (productId: string) => {
    try {
      const res = await apiService.delete(`/inventory/products/${productId}/`);
      return res;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
  DeleteProductImage: async (productId: string, imageId: string) => {
    try {
      const res = await apiService.delete(
        `/inventory/products/${productId}/images/${imageId}/`,
      );
      return res;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },
  getProductImages: async (productId: string) => {
    try {
      const res = await apiService.get(
        `/inventory/products/${productId}/images/`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching images:", error);
      throw error;
    }
  },

  AddProductImage: async (productId: string, formData: any) => {
    try {
      const res = await apiService.postFormData(
        `/inventory/products/${productId}/images/`,
        formData,
      );
      return res;
    } catch (error) {
      console.error("Error adding image:", error);
      throw error;
    }
  },
  SetPrimaryImage: async (productId: string, imageId: string) => {
    try {
      const res = await apiService.post(
        `/inventory/products/${productId}/images/${imageId}/set-primary/`,
      );
      return res;
    } catch (error) {
      console.error("Error setting primary image:", error);
      throw error;
    }
  },
  receiveStockBatch: async (productId: string, data: any) => {
    try {
      const res = await apiService.post(
        `/inventory/products/${productId}/batches/`,
        data
      );
      return res;
    } catch (error) {
      console.error("Error receiving stock batch:", error);
      throw error;
    }
  },
  updateStockBatch: async (productId: string, batchId: string, data: any) => {
    try {
      const res = await apiService.patch(
        `/inventory/products/${productId}/batches/${batchId}/`,
        data
      );
      return res;
    } catch (error) {
      console.error("Error updating stock batch:", error);
      throw error;
    }
  },
  deleteStockBatch: async (productId: string, batchId: string) => {
    try {
      const res = await apiService.delete(
        `/inventory/products/${productId}/batches/${batchId}/`
      );
      return res;
    } catch (error) {
      console.error("Error deleting stock batch:", error);
      throw error;
    }
  },
  getInventoryStats: async () => {
    try {
      const res = await apiService.get("/inventory/products/stats/");
      return res;
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
      throw error;
    }
  },
};

