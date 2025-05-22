import { login as apiLogin, register as apiRegister } from './api';
// Функция для сохранения данных авторизации в localStorage
const saveAuthData = (data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('tokenType', data.token_type);
    localStorage.setItem('userId', String(data.user.id));
    localStorage.setItem('username', data.user.username);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('isAdmin', String(data.user.is_admin || false));
};
// Функция для входа в систему
export const login = async (credentials) => {
    try {
        // Попытка входа с использованием разных эндпоинтов
        const data = await apiLogin(credentials);
        // Сохранение данных авторизации
        saveAuthData(data);
        return data;
    }
    catch (error) {
        console.error('Ошибка при входе:', error);
        throw error;
    }
};
// Функция для регистрации
export const register = async (userData) => {
    try {
        // Попытка регистрации с использованием разных эндпоинтов
        const data = await apiRegister(userData);
        // Сохранение данных авторизации после успешной регистрации
        saveAuthData(data);
        return data;
    }
    catch (error) {
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
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
// Функция для проверки прав администратора
export const isAdmin = () => {
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
