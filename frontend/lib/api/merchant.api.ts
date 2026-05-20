import { apiService } from "../services/apiService";

export const merchantApi = {
  getMerchants: async () => {
    try {
      const res = await apiService.get("/merchants/");
      return res;
    } catch (error) {
      console.error("Error fetching merchant:", error);
      throw error;
    }
  },

  getMerchant: async (merchantId: string) => {
    try {
      const res = await apiService.get(`/merchants/${merchantId}/`);
      return res;
    } catch (error) {
      console.error("Error fetching merchant:", error);
      throw error;
    }
  },
};
