// Базовые типы для API
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: Record<string, string[]>;
}

// Типы для аутентификации
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

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
  email: string;
  full_name?: string;
  is_active: boolean;
  address?: string;
  phone?: string;
}