// lib/api.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for cookies
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      },
    );
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
  ) {
    const response = await this.client.post("/auth/signup", {
      email,
      password,
      username,
      full_name,
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
