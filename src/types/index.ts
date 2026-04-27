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

export interface Profile {
  id: string;
  name: string;
  gender: string;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  gender_probability?: number;
  country_probability?: number;
  sample_size?: number;
  created_at?: string;
}

export interface ProfilesResponse {
  status: "success" | "error";
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links?: {
    self: string;
    next: string | null;
    prev: string | null;
  };
  data: Profile[];
}

export interface ProfileResponse {
  status: "success" | "error";
  data: Profile;
  message?: string;
}

export interface GetProfilesParams {
  [key: string]: string | number | undefined; // add this
  page?: number;
  limit?: number;
  sort_by?: "age" | "created_at" | "gender_probability";
  order?: "asc" | "desc";
  gender?: string;
  country_id?: string;
  age_group?: string;
  min_age?: number;
  max_age?: number;
  min_gender_probability?: number;
  min_country_probability?: number;
}
