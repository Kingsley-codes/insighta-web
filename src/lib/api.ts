// lib/api.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError, GetProfilesParams } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "X-API-Version": "1.0", // Required by backend
      },
      withCredentials: true, // Important for cookies
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as
          | RetryableRequestConfig
          | undefined;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          this.shouldAttemptRefresh(originalRequest)
        ) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            throw this.normalizeError(refreshError);
          }
        }

        throw this.normalizeError(error);
      },
    );

    // Request interceptor to always include API version
    this.client.interceptors.request.use((config) => {
      config.headers["X-API-Version"] = "1.0";
      return config;
    });
  }

  private shouldAttemptRefresh(config?: RetryableRequestConfig) {
    if (!config || config._retry || config.skipAuthRefresh) {
      return false;
    }

    const url = config.url ?? "";
    const refreshExcludedRoutes = [
      "/auth/login",
      "/auth/signup",
      "/auth/logout",
      "/auth/refresh",
      "/auth/github",
    ];

    return !refreshExcludedRoutes.some((route) => url.includes(route));
  }

  private normalizeError(error: unknown) {
    if (axios.isAxiosError<ApiError>(error) && error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    return error;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.client
        .post(
          "/auth/refresh",
          {},
          { skipAuthRefresh: true } as RetryableRequestConfig,
        )
        .then(() => undefined)
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  private buildQueryString(params: Record<string, string | number | undefined>) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    return queryParams.toString();
  }

  async login(email: string, password: string) {
    const response = await this.client.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async signup(
    email: string,
    password: string,
    username: string,
    full_name: string,
    role: "admin" | "analyst",
  ) {
    const response = await this.client.post("/auth/signup", {
      email,
      password,
      username,
      full_name,
      role,
    });
    return response.data;
  }

  async logout() {
    const response = await this.client.post("/auth/logout");
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  getGitHubAuthUrl() {
    return `${API_BASE_URL}/auth/github`;
  }

  // Profile methods
  async getProfiles(params: GetProfilesParams = {}) {
    const queryString = this.buildQueryString(params);
    const url = `/api/profiles${queryString ? `?${queryString}` : ""}`;
    const response = await this.client.get(url);
    return response.data;
  }

  async getProfileById(id: string) {
    const response = await this.client.get(`/api/profiles/${id}`);
    return response.data;
  }

  async createProfile(name: string) {
    const response = await this.client.post("/api/profiles", { name });
    return response.data;
  }

  async deleteProfile(id: string) {
    const response = await this.client.delete(`/api/profiles/${id}`);
    return response.data;
  }

  async searchProfiles(query: string, params: GetProfilesParams = {}) {
    const queryString = this.buildQueryString({ q: query, ...params });

    const response = await this.client.get(
      `/api/profiles/search?${queryString}`,
    );
    return response.data;
  }

  async exportProfiles(
    format: "csv" = "csv",
    filters: Partial<GetProfilesParams> = {},
  ) {
    const queryString = this.buildQueryString({ format, ...filters });

    const response = await this.client.get(
      `/api/profiles/export?${queryString}`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  }

  // Helper to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
