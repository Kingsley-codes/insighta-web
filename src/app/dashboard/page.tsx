"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Download,
  Filter,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { getErrorMessage } from "@/lib/error-handler";
import { useSession } from "@/hooks/useSession";
import { GetProfilesParams, ProfileResponse, ProfilesResponse } from "@/types";

type ViewMode = "browse" | "search";

const DEFAULT_FILTERS: GetProfilesParams = {
  limit: 10,
  sort_by: "created_at",
  order: "desc",
  gender: "",
  age_group: "",
  country_id: "",
};

const AGE_GROUPS = ["child", "teen", "young-adult", "adult", "senior"];
const SORT_OPTIONS: NonNullable<GetProfilesParams["sort_by"]>[] = [
  "created_at",
  "age",
  "gender_probability",
];

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user, isAdmin, isAuthenticated } = useSession();

  const [viewMode, setViewMode] = useState<ViewMode>("browse");
  const [filters, setFilters] = useState<GetProfilesParams>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [nlpInput, setNlpInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [newProfileName, setNewProfileName] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);

  const hasStructuredFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "limit" || key === "sort_by" || key === "order") {
      return false;
    }

    return value !== undefined && value !== null && value !== "";
  });

  const profilesQuery = useQuery<ProfilesResponse>({
    queryKey: ["profiles", viewMode, page, filters, submittedSearch],
    enabled:
      isAuthenticated &&
      (viewMode === "browse" || submittedSearch.trim().length > 0),
    queryFn: async () => {
      if (viewMode === "search") {
        return apiClient.searchProfiles(submittedSearch, {
          page,
          limit: filters.limit,
        });
      }

      return apiClient.getProfiles({
        ...filters,
        page,
      });
    },
  });

  const profiles = profilesQuery.data?.data ?? [];
  const resolvedSelectedProfileId =
    profiles.find((profile) => profile.id === selectedProfileId)?.id ??
    profiles[0]?.id ??
    null;

  const detailQuery = useQuery<ProfileResponse>({
    queryKey: ["profile", resolvedSelectedProfileId],
    enabled: Boolean(resolvedSelectedProfileId && isAuthenticated),
    queryFn: async () =>
      apiClient.getProfileById(resolvedSelectedProfileId as string),
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => apiClient.createProfile(name),
    onSuccess: () => {
      toast.success("Profile created successfully");
      setNewProfileName("");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create profile"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.deleteProfile(id),
    onSuccess: () => {
      toast.success("Profile deleted");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete profile"));
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (viewMode === "search") {
        return apiClient.exportProfiles("csv", {
          page,
          limit: filters.limit,
        });
      }

      return apiClient.exportProfiles("csv", filters);
    },
    onSuccess: (blob) => {
      downloadBlob(
        blob,
        `profiles-export-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast.success("CSV export ready");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to export profiles"));
    },
  });

  const importMutation = useMutation({
    mutationFn: async (csvContent: string) =>
      apiClient.importProfiles(csvContent),
    onSuccess: (data) => {
      toast.success(`Imported ${data.data.imported} profiles successfully`);
      setImportFile(null);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to import profiles"));
    },
  });

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = nlpInput.trim();

    if (!trimmed) {
      toast.error("Enter a natural language query to search");
      return;
    }

    setPage(1);
    setSubmittedSearch(trimmed);
  };

  const handleCreateProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newProfileName.trim();

    if (!trimmed) {
      toast.error("Enter a profile name");
      return;
    }

    createMutation.mutate(trimmed);
  };

  const handleImportProfiles = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!importFile) {
      toast.error("Select a CSV file to import");
      return;
    }

    const csvContent = await importFile.text();
    importMutation.mutate(csvContent);
  };

  const totalResults = profilesQuery.data?.total ?? 0;
  const totalPages = profilesQuery.data?.total_pages ?? 1;
  const selectedProfile = detailQuery.data?.data;

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-linear-to-r from-sky-500/18 via-cyan-400/10 to-emerald-400/18 p-6 shadow-2xl"
      >
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              Stage 3 Workspace
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Profiles, search, and access control in one secure cockpit
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
              Analysts can browse and search profiles without touching code,
              while admins can create new records, manage access-sensitive
              actions, and export datasets for downstream work.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Active user
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {user?.full_name ?? user?.username}
              </p>
              <p className="mt-1 text-sm text-sky-100">{user?.role}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Result set
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {profilesQuery.isLoading ? "..." : totalResults}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {viewMode === "search"
                  ? "Natural language search"
                  : "Structured browse"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Page status
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {profilesQuery.data?.page ?? page}/{totalPages}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {hasStructuredFilters ? "Filters active" : "Default query"}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Query workspace
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Switch between exact filters and natural language exploration.
                </p>
              </div>

              <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/45 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("browse");
                    setPage(1);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    viewMode === "browse"
                      ? "bg-sky-400/20 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Browse
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("search");
                    setPage(1);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    viewMode === "search"
                      ? "bg-sky-400/20 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Search
                </button>
              </div>
            </div>

            {viewMode === "browse" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">Gender</span>
                  <select
                    value={filters.gender ?? ""}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        gender: event.target.value,
                      }));
                    }}
                    className="input-field border-white/10 bg-slate-950/60 text-white"
                  >
                    <option value="">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>

                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">Age group</span>
                  <select
                    value={filters.age_group ?? ""}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        age_group: event.target.value,
                      }));
                    }}
                    className="input-field border-white/10 bg-slate-950/60 text-white"
                  >
                    <option value="">All</option>
                    {AGE_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">
                    Country code
                  </span>
                  <input
                    value={filters.country_id ?? ""}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        country_id: event.target.value.toUpperCase(),
                      }));
                    }}
                    placeholder="NG"
                    className="input-field border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                  />
                </label>

                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">Sort by</span>
                  <select
                    value={filters.sort_by ?? "created_at"}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        sort_by: event.target
                          .value as GetProfilesParams["sort_by"],
                      }));
                    }}
                    className="input-field border-white/10 bg-slate-950/60 text-white"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">Min age</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.min_age ?? ""}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        min_age: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }));
                    }}
                    className="input-field border-white/10 bg-slate-950/60 text-white"
                  />
                </label>

                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">Max age</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.max_age ?? ""}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        max_age: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }));
                    }}
                    className="input-field border-white/10 bg-slate-950/60 text-white"
                  />
                </label>

                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">Order</span>
                  <select
                    value={filters.order ?? "desc"}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        order: event.target.value as "asc" | "desc",
                      }));
                    }}
                    className="input-field border-white/10 bg-slate-950/60 text-white"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </label>

                <label className="text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">
                    Rows per page
                  </span>
                  <select
                    value={filters.limit ?? 10}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        limit: Number(event.target.value),
                      }));
                    }}
                    className="input-field border-white/10 bg-slate-950/60 text-white"
                  >
                    {[10, 20, 30, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setFilters(DEFAULT_FILTERS);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset filters
                  </button>
                  <button
                    type="button"
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-60"
                  >
                    {exportMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Export CSV
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <label className="block text-sm text-slate-200">
                    <span className="mb-2 block text-slate-300">
                      Search prompt
                    </span>
                    <div className="flex flex-col gap-3 md:flex-row">
                      <input
                        value={nlpInput}
                        onChange={(event) => setNlpInput(event.target.value)}
                        placeholder='e.g. "young males from nigeria"'
                        className="input-field border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                      >
                        <Search className="h-4 w-4" />
                        Run search
                      </button>
                    </div>
                  </label>
                </form>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                  <p className="font-medium text-white">Search parser notes</p>
                  <p className="mt-2 leading-6">
                    The backend interprets natural language and still returns
                    paginated results. Use this mode for exploratory analyst
                    queries, then switch back to Browse for exact filtering.
                  </p>
                  {submittedSearch ? (
                    <p className="mt-3 text-sky-200">
                      Current query: {submittedSearch}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Profiles list
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Filters, sorting, pagination, and full-detail drill down.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                <Filter className="h-3.5 w-3.5" />
                {totalResults} matching profiles
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-slate-950/50 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3">Age</th>
                      <th className="px-4 py-3">Country</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-slate-950/20 text-sm">
                    {profilesQuery.isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-slate-300"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading profiles
                          </span>
                        </td>
                      </tr>
                    ) : null}

                    {!profilesQuery.isLoading && profiles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-slate-300"
                        >
                          No profiles found for this query.
                        </td>
                      </tr>
                    ) : null}

                    {profiles.map((profile) => (
                      <tr
                        key={profile.id}
                        className={`transition hover:bg-white/5 ${
                          resolvedSelectedProfileId === profile.id
                            ? "bg-sky-400/10"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileId(profile.id)}
                            className="text-left"
                          >
                            <p className="font-medium text-white">
                              {profile.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {profile.id}
                            </p>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-slate-200">
                          {profile.gender}
                        </td>
                        <td className="px-4 py-4 text-slate-200">
                          {profile.age}{" "}
                          <span className="text-xs text-slate-400">
                            ({profile.age_group})
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-200">
                          {profile.country_name} ({profile.country_id})
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedProfileId(profile.id)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                            >
                              View
                            </button>
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteMutation.mutate(profile.id)
                                }
                                disabled={deleteMutation.isPending}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {profilesQuery.isError ? (
              <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {getErrorMessage(
                  profilesQuery.error,
                  "Failed to load profiles",
                )}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                Page {profilesQuery.data?.page ?? page} of {totalPages}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || profilesQuery.isLoading}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || profilesQuery.isLoading}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {isAdmin ? (
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-200">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Admin controls
                  </h2>
                  <p className="text-sm text-slate-300">
                    Create and manage protected profile records.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateProfile} className="mt-5 space-y-3">
                <label className="block text-sm text-slate-200">
                  <span className="mb-2 block text-slate-300">
                    Profile name
                  </span>
                  <input
                    value={newProfileName}
                    onChange={(event) => setNewProfileName(event.target.value)}
                    placeholder="Harriet Tubman"
                    className="input-field border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                  />
                </label>

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create profile
                </button>
              </form>

              <div className="mt-6 border-t border-white/10 pt-6">
                <form onSubmit={handleImportProfiles} className="space-y-3">
                  <label className="block text-sm text-slate-200">
                    <span className="mb-2 block text-slate-300">
                      Import CSV
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(event) =>
                        setImportFile(event.target.files?.[0] || null)
                      }
                      className="input-field border-white/10 bg-slate-950/60 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white file:hover:bg-sky-400"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={importMutation.isPending || !importFile}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60"
                  >
                    {importMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Import profiles
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Analyst access
                  </h2>
                  <p className="text-sm text-slate-300">
                    Read-only access is active. Search, filter, inspect, and
                    export.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-xl backdrop-blur">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Profile detail
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Full record preview from `GET /api/profiles/:id`.
              </p>
            </div>

            {detailQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading profile detail
                </span>
              </div>
            ) : null}

            {!detailQuery.isLoading && selectedProfile ? (
              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Identity
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {selectedProfile.name}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-400">
                    {selectedProfile.id}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Stat label="Gender" value={selectedProfile.gender} />
                  <Stat label="Age group" value={selectedProfile.age_group} />
                  <Stat label="Age" value={String(selectedProfile.age)} />
                  <Stat
                    label="Country"
                    value={`${selectedProfile.country_name} (${selectedProfile.country_id})`}
                  />
                  <Stat
                    label="Gender confidence"
                    value={
                      selectedProfile.gender_probability !== undefined
                        ? `${Math.round(selectedProfile.gender_probability * 100)}%`
                        : "N/A"
                    }
                  />
                  <Stat
                    label="Country confidence"
                    value={
                      selectedProfile.country_probability !== undefined
                        ? `${Math.round(selectedProfile.country_probability * 100)}%`
                        : "N/A"
                    }
                  />
                </div>

                {selectedProfile.created_at ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-slate-300">
                    Created at:{" "}
                    <span className="font-medium text-white">
                      {new Date(selectedProfile.created_at).toLocaleString()}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!detailQuery.isLoading && !selectedProfile ? (
              <div className="py-10 text-center text-sm text-slate-300">
                Select a profile to inspect the full record.
              </div>
            ) : null}

            {detailQuery.isError ? (
              <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {getErrorMessage(
                  detailQuery.error,
                  "Failed to load profile detail",
                )}
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-medium text-white">{value}</p>
    </div>
  );
}
