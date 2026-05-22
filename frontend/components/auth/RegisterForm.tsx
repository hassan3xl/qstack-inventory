"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Mail, User2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/ToastProvider";
import { apiService } from "@/lib/services/apiService";
import { useForm } from "react-hook-form";

type FormValues = {
  email: string;
  password1: string;
  password2: string;
};

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const res = await apiService.postWithoutToken("/auth/register/", {
        email: data.email,
        password1: data.password1,
        password2: data.password2,
      });

      if (res.access) {
        addToast({
          title: "Account created successfully!",
          description: "Please sign in.",
          type: "success",
          duration: 6000,
        });

        // Redirect to login page after successful signup
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        addToast({
          title: "Sign up failed",
          description:
            res.message || "Please check your information and try again.",
          type: "error",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes("409")) {
        errorMessage = "An account with this email already exists.";
      }

      addToast({
        title: "Sign up error",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-8 rounded-lg shadow-lg border border-border bg-card">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-muted-foreground">Join us today and get started</p>
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            name="email"
            icon={Mail}
            register={register}
            type="email"
            placeholder="you@example.com"
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Password"
              name="password1"
              icon={Key}
              register={register}
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              disabled={isLoading}
              minLength={6}
              className="w-full pr-10"
            />
          </div>
          <div className="relative">
            <Input
              label="Confirm Password"
              name="password2"
              icon={Key}
              register={register}
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              disabled={isLoading}
              minLength={6}
              className="w-full pr-10"
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            title="Terms"
            className="text-primary hover:underline"
            id="terms-link"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            title="Privacy"
            className="text-primary hover:underline"
            id="privacy-link"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          id="register-submit-button"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-sm text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            title="Sign In"
            className="text-primary font-medium hover:underline"
            id="login-link"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
