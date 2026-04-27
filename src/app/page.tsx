// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  Lock,
  Cloud,
  GitBranch,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Role-based access control with GitHub OAuth and secure session management",
    },
    {
      icon: Zap,
      title: "Real-time Intelligence",
      description:
        "Advanced profile intelligence with natural language search capabilities",
    },
    {
      icon: Users,
      title: "Multi-Interface Access",
      description: "Seamless experience across CLI, Web, and API interfaces",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Comprehensive metrics and insights for data-driven decisions",
    },
    {
      icon: Cloud,
      title: "Cloud Native",
      description:
        "Scalable architecture with rate limiting and request logging",
    },
    {
      icon: GitBranch,
      title: "Developer Friendly",
      description:
        "RESTful APIs with versioning and comprehensive documentation",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-primary-50 to-blue-50 opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
                Welcome to{" "}
                <span className="bg-linear-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  Insighta Labs+
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Secure, Scalable Profile Intelligence Platform for Modern Teams
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-3"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage and analyze profile intelligence at
              scale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
              >
                <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-primary-100 text-lg mb-8">
                Join thousands of teams using Insighta Labs+ for their
                intelligence needs
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-[1.02]"
              >
                Create Free Account
                <Lock className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
