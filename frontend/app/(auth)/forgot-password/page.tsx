"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { apiService } from "@/lib/services/apiService";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const onSubmit = async (data: any) => {
    setLoading(true);
    setStatus("idle");
    try {
      await apiService.postWithoutToken("/auth/password/reset/", { email: data.email });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-black mb-4 text-emerald-600">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            If an account exists for that email, we have sent instructions on how to reset your password.
          </p>
          <Link href="/login" className="text-primary font-bold hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
          <MoveLeft className="w-4 h-4 mr-2" /> Back to login
        </Link>
        
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Reset Password</h2>
        <p className="text-gray-500 text-sm mb-8 font-medium">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {status === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold">
              Something went wrong. Please try again.
            </div>
          )}
          
          <div className="space-y-1">
            <Input
              register={register}
              type="email"
              label="Email Address"
              name="email"
              placeholder="you@company.com"
              className="w-full border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
