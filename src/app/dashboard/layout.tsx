"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, LogOut, ShieldCheck } from "lucide-react";
import { useSession } from "@/hooks/useSession";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">
              Securing workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-100">
      <div className="absolute inset-x-0 top-0 h-72 bg-linear-to-r from-cyan-400/12 via-sky-500/12 to-emerald-400/12 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-sky-400/15 p-3 text-sky-200">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <Link href="/" className="text-lg font-semibold text-white">
                Insighta Labs+
              </Link>
              <p className="text-sm text-slate-300">
                Secure profile intelligence dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Signed in
              </p>
              <div className="mt-1 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span className="font-medium text-white">
                  {user?.username ?? user?.email}
                </span>
                <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-xs uppercase tracking-[0.14em] text-sky-200">
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <nav className="mb-6 flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
          <Link
            href="/dashboard"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              pathname === "/dashboard"
                ? "bg-sky-400/20 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            Workspace
          </Link>
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
