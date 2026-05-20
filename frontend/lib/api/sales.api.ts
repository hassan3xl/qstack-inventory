import { apiService } from "../services/apiService";

export const salesApi = {
  getSales: async () => {
    try {
      const res = await apiService.get("/sales/");
      return res;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  },

  getSale: async (saleId: string) => {
    try {
      const res = await apiService.get(`/sales/${saleId}/`);
      return res;
    } catch (error) {
      console.error("Error fetching sale:", error);
      throw error;
    }
  },

  createSale: async (saleData: {
    payment_method: string;
    tax?: number;
    discount?: number;
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
  }) => {
    try {
      const res = await apiService.post("/sales/", saleData);
      return res;
    } catch (error) {
      console.error("Error creating sale:", error);
      throw error;
    }
  },
};
