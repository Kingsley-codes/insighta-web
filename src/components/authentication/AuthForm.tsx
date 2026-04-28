"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  username: string;
  full_name: string;
  role: "admin" | "analyst";
}

export type AuthFormData = LoginFormData | SignupFormData;

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading: boolean;
}

export default function AuthForm({ type, onSubmit, isLoading }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>(
    type === "login"
      ? { email: "", password: "" }
      : {
          email: "",
          password: "",
          username: "",
          full_name: "",
          role: "analyst",
        },
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (type === "login") {
      setFormData((prev) => ({
        ...(prev as LoginFormData),
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...(prev as SignupFormData),
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const isSignup = type === "signup";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSignup && (
        <>
          <div>
            <label
              htmlFor="full_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={(formData as SignupFormData).full_name}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={(formData as SignupFormData).username}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                id="role"
                name="role"
                value={(formData as SignupFormData).role}
                onChange={handleChange}
                required
                className="input-field pl-10"
              >
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field pl-10"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-field pl-10 pr-12"
            placeholder="********"
            minLength={isSignup ? 8 : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {isSignup && (
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 8 characters and include uppercase,
            lowercase, a number, and a special character.
          </p>
        )}
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading
          ? "Processing..."
          : type === "login"
            ? "Sign In"
            : "Create Account"}
      </button>
    </form>
  );
}
