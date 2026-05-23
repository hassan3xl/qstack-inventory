"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { apiService } from "@/lib/services/apiService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoveLeft, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordConfirmPage({
  params,
}: {
  params: { uid: string; token: string };
}) {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data: any) => {
    if (data.new_password1 !== data.new_password2) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");
    
    try {
      await apiService.postWithoutToken("/auth/password/reset/confirm/", {
        uid: params.uid,
        token: params.token,
        new_password1: data.new_password1,
        new_password2: data.new_password2,
      });
      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(
        error?.response?.data?.detail || 
        error?.response?.data?.non_field_errors?.[0] || 
        "Failed to reset password. The link might be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-gray-100">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2 text-gray-900">Password Reset Complete</h2>
          <p className="text-gray-500 mb-8 font-medium">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full h-12 text-base font-bold rounded-lg">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Create New Password</h2>
        <p className="text-gray-500 text-sm mb-8 font-medium">
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {status === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-1">
            <Input
              register={register}
              type="password"
              label="New Password"
              name="new_password1"
              placeholder="••••••••"
              className="w-full border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
              required
            />
          </div>

          <div className="space-y-1">
            <Input
              register={register}
              type="password"
              label="Confirm New Password"
              name="new_password2"
              placeholder="••••••••"
              className="w-full border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-lg shadow-lg shadow-primary/20 mt-4"
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Resetting...</> : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
