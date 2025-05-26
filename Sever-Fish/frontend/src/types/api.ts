export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface UserData {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export interface ApiError {
  detail: string;
}