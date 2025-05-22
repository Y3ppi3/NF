/**
 * Основные настройки для API и запросов
 */
// Базовый URL API
export const API_BASE_URL = "http://127.0.0.1:8000";
// Альтернативные URL для API (в порядке приоритета)
export const API_ENDPOINTS = {
    // Эндпоинты для категорий 
    categories: [
        `${API_BASE_URL}/categories`,
        `${API_BASE_URL}/api/categories`,
        `${API_BASE_URL}/products/categories`
    ],
    // Эндпоинты для товаров
    products: [
        `${API_BASE_URL}/products`,
        `${API_BASE_URL}/api/products`
    ],
    // Эндпоинты для корзины
    cart: [
        `${API_BASE_URL}/cart`,
        `${API_BASE_URL}/api/cart`
    ],
    // Эндпоинты для авторизации
    auth: [
        `${API_BASE_URL}/auth/login`,
        `${API_BASE_URL}/api/auth/login`
    ],
    // Эндпоинты для регистрации
    register: [
        `${API_BASE_URL}/auth/register`,
        `${API_BASE_URL}/api/auth/register`
    ],
    // Эндпоинты для заказов
    orders: [
        `${API_BASE_URL}/orders`,
        `${API_BASE_URL}/api/orders`
    ],
    // Эндпоинты для профиля пользователя
    profile: [
        `${API_BASE_URL}/users/me`,
        `${API_BASE_URL}/api/users/me`
    ],
    // Эндпоинты для проверки здоровья API
    health: [
        `${API_BASE_URL}/health`,
        `${API_BASE_URL}/api/health`
    ]
};
// Настройки запросов
export const REQUEST_CONFIG = {
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};
// Функции для работы с локальным хранилищем
export const Storage = {
    // Токен авторизации
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),
    // Тип токена
    getTokenType: () => localStorage.getItem('tokenType') || 'Bearer',
    setTokenType: (type) => localStorage.setItem('tokenType', type),
    // Данные пользователя
    getUserId: () => localStorage.getItem('userId'),
    setUserId: (id) => localStorage.setItem('userId', id),
    getUsername: () => localStorage.getItem('username'),
    setUsername: (name) => localStorage.setItem('username', name),
    // Очистка всех данных авторизации
    clearAuthData: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAdmin');
    },
    // Сохранение URL для перенаправления после авторизации
    setRedirectPath: (path) => localStorage.setItem('redirectAfterAuth', path),
    getRedirectPath: () => localStorage.getItem('redirectAfterAuth'),
    clearRedirectPath: () => localStorage.removeItem('redirectAfterAuth')
};
