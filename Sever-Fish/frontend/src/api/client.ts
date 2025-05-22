import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '../types/api';
import { getToken, removeAuthData } from '../utils/storage';

// Базовый URL API
export const API_BASE_URL = 'http://localhost:8000/api';

// Создание экземпляра axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 секунд таймаут
});

// Перехватчик запросов - добавляем токен авторизации
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Перехватчик ответов - обработка ошибок
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Если 401 Unauthorized - разлогиниваем пользователя
    if (error.response?.status === 401) {
      removeAuthData();
      window.location.href = '/auth';
    }

    // Формируем объект ApiError для удобной обработки ошибок
    const apiError: ApiError = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.detail || 'Неизвестная ошибка',
      details: error.response?.data?.details,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;