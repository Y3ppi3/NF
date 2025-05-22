import apiClient from './client';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  UserData 
} from '../types/api';

export const authApi = {
  /**
   * Вход пользователя
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Регистрация нового пользователя
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  /**
   * Получение данных текущего пользователя
   */
  getCurrentUser: async (): Promise<UserData> => {
    const response = await apiClient.get<UserData>('/auth/me');
    return response.data;
  },

  /**
   * Обновление данных пользователя
   */
  updateUserProfile: async (data: Partial<UserData>): Promise<UserData> => {
    const response = await apiClient.put<UserData>('/auth/me', data);
    return response.data;
  },
};