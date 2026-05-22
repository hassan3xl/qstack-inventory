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
    customer_id?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
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

  getCustomers: async (search?: string) => {
    try {
      const url = search ? `/sales/customers/?search=${encodeURIComponent(search)}` : "/sales/customers/";
      const res = await apiService.get(url);
      return res;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  createCustomer: async (customerData: { name: string; phone: string; email?: string }) => {
    try {
      const res = await apiService.post("/sales/customers/", customerData);
      return res;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },
};
