// components/GitHubButton.tsx
"use client";

import { FaGithub } from "react-icons/fa";
import { useState } from "react";

interface GitHubButtonProps {
  text?: string;
}

export default function GitHubButton({
  text = "Continue with GitHub",
}: GitHubButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/auth/github`, {
      credentials: "include",
    });
    const data = await res.json();
    window.location.href = data.data.url;
  };

  return (
    <button
      onClick={handleGitHubLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FaGithub />
      {isLoading ? "Redirecting..." : text}
    </button>
  );
}
