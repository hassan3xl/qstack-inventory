import { apiService } from "../services/apiService";

export const profileApi = {
  getProfile: async () => {
    try {
      const res = await apiService.get("/user/profile/me/");
      return res;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },
  updateProfile: async (profileData: any) => {
    try {
      const res = await apiService.patch("/user/profile/me/", profileData);
      return res;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
  updatePassword: async (passwordData: any) => {
    try {
      const res = await apiService.post("/auth/password/change/", passwordData);
      return res;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};
