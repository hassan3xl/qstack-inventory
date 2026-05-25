import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { Profile } from "../types/user.types";

export function useGetProfile() {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      return await profileApi.updateProfile(profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: any) => {
      return await profileApi.updatePassword(passwordData);
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await profileApi.requestPasswordReset(email);
    },
  });
};
