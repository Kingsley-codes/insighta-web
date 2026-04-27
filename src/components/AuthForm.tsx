// components/AuthForm.tsx
"use client";

import { useState } from "react";
import { Mail, Lock, User, Users } from "lucide-react";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function AuthForm({ type, onSubmit, isLoading }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData =
      type === "login"
        ? { email: formData.email, password: formData.password }
        : formData;
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {type === "signup" && (
        <>
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="johndoe"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-field pl-10"
            placeholder="••••••••"
            minLength={type === "signup" ? 6 : undefined}
          />
        </div>
        {type === "signup" && (
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 6 characters
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
