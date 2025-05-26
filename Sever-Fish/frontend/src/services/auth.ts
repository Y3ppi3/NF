import api, { API_BASE_URL, login as apiLogin, register as apiRegister } from './api';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_admin?: boolean;
  };
}

// Функция для сохранения данных авторизации в localStorage
const saveAuthData = (data: AuthResponse) => {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('tokenType', data.token_type);
  localStorage.setItem('userId', String(data.user.id));
  localStorage.setItem('username', data.user.username);
  localStorage.setItem('userEmail', data.user.email);
  localStorage.setItem('isAdmin', String(data.user.is_admin || false));
};

// Функция для входа в систему
export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  try {
    // Попытка входа с использованием разных эндпоинтов
    const data = await apiLogin(credentials);
    
    // Сохранение данных авторизации
    saveAuthData(data);
    
    return data;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
};

// Функция для регистрации
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    // Попытка регистрации с использованием разных эндпоинтов
    const data = await apiRegister(userData);
    
    // Сохранение данных авторизации после успешной регистрации
    saveAuthData(data);
    
    return data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
};

// Функция для выхода из системы
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAdmin');
  
  // Дополнительные действия, например, перенаправление на страницу входа
  window.location.href = '/auth';
};

// Функция для проверки авторизации пользователя
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Функция для проверки прав администратора
export const isAdmin = (): boolean => {
  return localStorage.getItem('isAdmin') === 'true';
};

// Функция для получения данных текущего пользователя
export const getCurrentUser = () => {
  return {
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    email: localStorage.getItem('userEmail'),
    isAdmin: localStorage.getItem('isAdmin') === 'true'
  };
};

export default {
  login,
  register,
  logout,
  isAuthenticated,
  isAdmin,
  getCurrentUser
};