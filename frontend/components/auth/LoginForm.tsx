"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Key, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleLogin } from "@/lib/actions/auth.actions";
import { apiService, getBackendErrorMessage } from "@/lib/services/apiService";
import { useForm } from "react-hook-form";
import { toast } from "sonner"

type FormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const response = await apiService.postWithoutToken("/auth/login/", {
        email: data.email,
        password: data.password,
      });

      if (response.access) {
        await handleLogin(response.user, response.access);
        toast.success("Login successful!", {
          description: "Welcome back!",
        });

        // Small delay to show the toast before redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error("Login failed", {
          description:
            response.detail || "Please check your credentials and try again.",
        });
      }
    } catch (error: any) {
      console.log("Login error:", error);
      const errorMessage = getBackendErrorMessage(error);
      toast.error("Login failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  return (
    <div className="w-full max-w-sm p-8 rounded-lg shadow-lg border border-border bg-card">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            icon={Mail}
            name="email"
            register={register}
            placeholder="you@example.com"
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Input
            icon={Key}
            name="password"
            register={register}
            label="Password"
            placeholder="Password"
            type="password"
            disabled={isLoading}
          />
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            title="Forgot Password"
            className="text-sm text-primary hover:underline"
            id="forgot-password-link"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
          id="login-submit-button"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
