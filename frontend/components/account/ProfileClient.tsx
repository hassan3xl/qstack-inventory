"use client";

import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { useGetProfile, useUpdateProfile, useUpdatePassword } from "@/lib/hooks/profile.hook";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/providers/ToastProvider";

const ProfileClient = () => {
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const { register, handleSubmit } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm } = useForm();
  const { data: profile } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();
  const { addToast } = useToast();

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      await updateProfileMutation.mutateAsync(data);
      addToast({ title: "Success", description: "Profile updated successfully!", type: "success" });
    } catch (error) {
      addToast({ title: "Error", description: "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.new_password1 !== data.new_password2) {
      addToast({ title: "Error", description: "New passwords do not match.", type: "error" });
      return;
    }
    
    try {
      setPasswordSaving(true);
      await updatePasswordMutation.mutateAsync({
        old_password: data.old_password,
        new_password1: data.new_password1,
        new_password2: data.new_password2
      });
      addToast({ title: "Success", description: "Password changed successfully!", type: "success" });
      resetPasswordForm();
    } catch (error) {
      addToast({ title: "Error", description: "Failed to change password. Ensure your old password is correct.", type: "error" });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="border w-3xl mx-auto bg-muted border-border p-4 sm:p-6 rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-primary">My Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border mb-3"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e}
            className="text-sm text-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              register={register}
              type="input"
              label="First Name"
              name="first_name"
              defaultValue={profile.first_name || ""}
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <Input
              register={register}
              type="input"
              label="Last Name"
              name="last_name"
              defaultValue={profile.last_name || ""}
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        <div>
          <Input
            register={register}
            type="input"
            label="Phone"
            name="phone"
            defaultValue={profile.phone || ""}
            className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Bio</label>
          <Input
            register={register}
            type="textarea"
            name="bio"
            field="textarea"
            defaultValue={profile.bio || ""}
            rows={3}
            className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="email_notifications"
            defaultChecked={profile.email_notifications || false}
            onChange={(e) => e}
          />
          <label className="text-sm text-gray-700">
            Receive Email Notifications
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-xl font-bold mb-6 text-primary">Change Password</h3>
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
          <div>
            <Input
              register={registerPassword}
              type="password"
              label="Current Password"
              name="old_password"
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                register={registerPassword}
                type="password"
                label="New Password"
                name="new_password1"
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <Input
                register={registerPassword}
                type="password"
                label="Confirm New Password"
                name="new_password2"
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-semibold transition mt-4"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileClient;
