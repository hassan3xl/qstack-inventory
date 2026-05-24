"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ThemeSwitcher } from "@/providers/theme-switcher";
import { Button } from "@/components/ui/button";
import { NormalInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetProfile,
  useUpdateProfile,
  useUpdatePassword,
  useRequestPasswordReset,
} from "@/lib/hooks/profile.hook";
import { User, Lock, Eye, CheckCircle2, Moon, Loader2 } from "lucide-react";

type ActiveTab = "profile" | "security" | "appearance";

const AccountPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  // Profile hook
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    email_notifications: false,
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        email_notifications: profile.email_notifications || false,
      });
    }
  }, [profile]);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const updatePasswordMutation = useUpdatePassword();
  const requestPasswordResetMutation = useRequestPasswordReset();

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(profileData);
      toast.success("Profile Updated", {
        description: "Your personal details have been saved successfully.",
      });
    } catch (err: any) {
      toast.error("Update Failed", {
        description:
          err?.message || "There was an error updating your profile.",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Validation Error", {
        description: "New passwords do not match.",
      });
      return;
    }
    try {
      await updatePasswordMutation.mutateAsync({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success("Password Changed", {
        description: "Your password has been updated successfully.",
      });
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      toast.error("Error Changing Password", {
        description:
          err?.message || "Verify your current password and try again.",
      });
    }
  };

  const handleForgotPassword = async () => {
    const email = user?.email;
    if (!email) {
      toast.error("Email address not found on your profile.");
      return;
    }

    try {
      await requestPasswordResetMutation.mutateAsync(email);
      toast.success("Reset Link Sent", {
        description: "Please check your email for a password reset link.",
      });
    } catch (error) {
      toast.error("Failed to send password reset email.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <Header
        title="Account Settings"
        subtitle="Manage your profile information, password, and preferences."
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex md:flex-col gap-2 bg-card p-3 rounded-[1.8rem] border border-border/40 shadow-sm h-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm text-left ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm text-left ${
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="w-4 h-4" />
            Security & Login
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm text-left ${
              activeTab === "appearance"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="w-4 h-4" />
            Appearance
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card className="rounded-xl border-border/40 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  Personal Profile
                </CardTitle>
                <CardDescription>
                  Update your contact details and bio visible to store
                  administrators.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="space-y-4 py-6">
                    <div className="h-10 bg-muted rounded-2xl animate-pulse w-full" />
                    <div className="h-10 bg-muted rounded-2xl animate-pulse w-full" />
                    <div className="h-28 bg-muted rounded-2xl animate-pulse w-full" />
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                          First Name
                        </label>
                        <NormalInput
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          placeholder="First Name"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                          Last Name
                        </label>
                        <NormalInput
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          placeholder="Last Name"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                        Email Address (Read-only)
                      </label>
                      <NormalInput
                        value={user?.email || ""}
                        disabled
                        className="rounded-xl bg-muted/65 cursor-not-allowed opacity-80"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                        Phone Number
                      </label>
                      <NormalInput
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="Phone Number"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                        Bio / Notes
                      </label>
                      <Textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <input
                        type="checkbox"
                        id="email_notifications"
                        name="email_notifications"
                        checked={profileData.email_notifications}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 rounded border-border/80 text-primary focus:ring-primary/20 accent-primary"
                      />
                      <label
                        htmlFor="email_notifications"
                        className="text-sm font-bold cursor-pointer"
                      >
                        Receive system update & inventory notifications
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="rounded-xl w-full py-6 font-bold shadow-lg shadow-primary/10"
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="rounded-xl border-border/40 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  Change Password
                </CardTitle>
                <CardDescription>
                  Keep your account secure by periodically updating your
                  password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Current Password
                    </label>
                    <NormalInput
                      type="password"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                      className="rounded-xl"
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={requestPasswordResetMutation.isPending}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        {requestPasswordResetMutation.isPending ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Sending
                            link...
                          </>
                        ) : (
                          "Forgot Current Password?"
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      New Password
                    </label>
                    <NormalInput
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Confirm New Password
                    </label>
                    <NormalInput
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="rounded-xl w-full py-6 font-bold shadow-lg shadow-primary/10"
                  >
                    {updatePasswordMutation.isPending
                      ? "Updating Password..."
                      : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card className="rounded-xl border-border/40 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  Display Preferences
                </CardTitle>
                <CardDescription>
                  Configure system appearance mode and personalize your
                  experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">System Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Choose between light mode, dark mode, or system auto
                      preferences.
                    </p>
                  </div>
                  <ThemeSwitcher />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
