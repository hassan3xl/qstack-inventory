import { apiService } from "../services/apiService";

export const StoreApi = {
  getStore: async () => {
    try {
      const res = await apiService.get("/business/profile/");
      return res;
    } catch (error) {
      console.error("Error fetching business profile:", error);
      throw error;
    }
  },

  UpdateStore: async (storeData: any) => {
    try {
      const res = await apiService.patch("/business/profile/", storeData);
      return res;
    } catch (error) {
      console.error("Error updating business profile:", error);
      throw error;
    }
  },

  UpdateStoreStatus: async (storeData: any) => {
    try {
      const res = await apiService.patch(
        "/business/profile/status/",
        storeData,
      );
      return res;
    } catch (error) {
      console.error("Error updating business profile status:", error);
      throw error;
    }
  },

  UpdateStoreLogo: async (storeData: any) => {
    try {
      const res = await apiService.postFormData("/business/logo/", storeData);
      return res;
    } catch (error) {
      console.error("Error updating business profile logo:", error);
      throw error;
    }
  },
  // Staff Management
  getStaff: async () => {
    try {
      const res = await apiService.get("/staff/list/"); // I need to implement this in backend
      return res;
    } catch (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
  },

  addStaff: async (staffData: any) => {
    try {
      const res = await apiService.post("/staff/add/", staffData); // I need to implement this in backend
      return res;
    } catch (error) {
      console.error("Error adding staff:", error);
      throw error;
    }
  },
};
