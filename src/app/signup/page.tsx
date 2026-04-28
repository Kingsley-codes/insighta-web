// app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BarChart3, ArrowLeft } from "lucide-react";
import AuthForm, {
  AuthFormData,
} from "../../components/authentication/AuthForm";
import GitHubButton from "@/components/authentication/GitHubButton";
import apiClient from "@/lib/api";
import { getErrorMessage } from "@/lib/error-handler";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (data: AuthFormData) => {
    // Type guard to ensure we have signup data
    if ("username" in data && "full_name" in data && "role" in data) {
      setIsLoading(true);
      try {
        const response = await apiClient.signup(
          data.email,
          data.password,
          data.username,
          data.full_name,
          data.role,
        );

        if (response.status === "success") {
          toast.success("Account created successfully! Please sign in.");
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          toast.error(response.message || "Signup failed");
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "Unable to create account");
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <BarChart3 className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join Insighta Labs+ today</p>
        </div>

        <div className="card">
          <AuthForm
            type="signup"
            onSubmit={handleSignup}
            isLoading={isLoading}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <GitHubButton />
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
