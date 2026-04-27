// types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: "admin" | "analyst";
  avatar_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  full_name: string;
}

export interface AuthResponse {
  status: "success" | "error";
  message?: string;
  user?: User;
  access_token?: string;
  refresh_token?: string;
}

export interface ApiError {
  status: "error";
  message: string;
}
