import { apiService } from "../services/apiService";

export const sidebarApi = {
  getSidebar: async () => {
    try {
      const res = await apiService.get("/sidebar/");
      return res;
    } catch (error) {
      console.error("Error fetching sidebar:", error);
      throw error;
    }
  },
};
