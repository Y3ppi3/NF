import { getAuthToken, clearAuthToken } from './auth';
import axios from 'axios';

// Базовые URL API с учетом Docker окружения
export const API_BASE_URL = '/ais';
export const API_FULL_URL = `${API_BASE_URL}/api`;

// API Gateway URL для Docker окружения
const API_GATEWAY_URL = 'http://localhost:8080';

// Создание конфигурации для разных API
export const API_ENDPOINTS = {
    // Основной API Gateway
    gateway: {
        baseURL: '/ais/api',
        products: '/products',
        categories: '/categories',
        orders: '/orders',
        payments: '/payments',
        stocks: '/stocks',
        warehouses: '/warehouses',
        supplies: '/supplies',
        stockMovements: '/stock-movements'
    },
    // Прямое подключение к backend API
    backend: {
        baseURL: 'http://localhost:8001/api',
        products: '/products',
        categories: '/categories',
        orders: '/orders',
        payments: '/payments',
        stocks: '/stocks',
        warehouses: '/warehouses',
        supplies: '/supplies',
        stockMovements: '/stock-movements'
    },
    // API Север-Рыба
    severRyba: {
        baseURL: 'http://localhost:8000/api',
        products: '/products',
        categories: '/categories',
        orders: '/orders'
    }
};

// Типы для API данных
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category_id?: number;
    stock_quantity: number;
    image_url?: string;
    created_at: string;
    updated_at?: string;
    sku?: string;
    supplier?: string;
    sr_stock_quantity?: number;
    sr_sync?: boolean;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Order {
    id: number;
    user_id: number;
    total_price: number;
    created_at: string;
    status: string;
    client_name?: string;
    delivery_address?: string;
    order_items: OrderItem[];
    payment_method?: string;
    payment_status?: string;
}

export interface OrderItem {
    product_id: number;
    quantity: number;
    price: number;
}

// Функции для работы с API
export class APIError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'APIError';
    }
}

// Функция для безопасного выполнения API-запросов с пробованием нескольких URL
export const trySeveralEndpoints = async <T>(
    endpoints: string[],
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
    data?: any,
    config: any = {}
): Promise<T> => {
    // Получаем токен из хранилища - важно получать его здесь для каждого запроса,
    // так как токен мог быть обновлён между запросами
    const token = getAuthToken();

    // Правильно формируем заголовок авторизации
    const headers = {
        'Content-Type': 'application/json',
        // Важно: Проверяем наличие токена и корректно формируем заголовок
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...config.headers
    };

    // Удаляем жёстко закодированные endpoint'ы для продуктов
    // const dockerEndpoints = [
    //     `${API_GATEWAY_URL}/ais/api/products`,
    //     `${API_GATEWAY_URL}/products`
    // ];

    // Используем только переданные endpoints
    const allEndpoints = endpoints;

    for (const endpoint of allEndpoints) {
        try {
            console.log(`Trying to ${method} from endpoint: ${endpoint}`);
            console.log(`Authorization header: ${headers.Authorization ? 'Set' : 'Not set'}`);

            const response = await axios({
                method,
                url: endpoint,
                data,
                headers,
                ...config
            });

            console.log(`Successfully got response from ${endpoint}`);
            return response.data;
        } catch (error) {
            console.log(`Failed to ${method} from ${endpoint}:`, error);

            // Если получили 401, возможно нам нужно обновить токен
            if (error.response && error.response.status === 401) {
                console.warn('Получен 401 Unauthorized, возможно требуется обновление токена');
                // Здесь можно добавить логику обновления токена при необходимости
            }
        }
    }

    // В случае всех ошибок, возвращаем пустой массив
    console.warn('All API endpoints failed, returning empty array');
    return [] as unknown as T;
};

// Функция для работы с API с поддержкой авторизации через fetch
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const token = getAuthToken();
    const finalEndpoint = endpoint.startsWith('/')
        ? `${API_FULL_URL}${endpoint}`
        : `${API_FULL_URL}/${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
    };

    try {
        console.log(`Fetching from: ${finalEndpoint}`);
        const response = await fetch(finalEndpoint, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Если ответ 401 (Unauthorized), очищаем токен и перенаправляем на страницу входа
            if (response.status === 401) {
                clearAuthToken();
                window.location.href = '/login';
                throw new Error('Unauthorized: Please login again');
            }

            const errorText = await response.text();
            console.error(`API Error ${response.status}: ${errorText}`);
            throw new APIError(`API Error: ${response.status} ${response.statusText}`, response.status);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error, 'Endpoint:', finalEndpoint);
        throw error;
    }
};

// API функции для продуктов - с проверкой нескольких URL
export const getProducts = async (categoryId?: number) => {
    console.log("Fetching products...");
    const endpoints = [
        `${API_FULL_URL}/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `${API_BASE_URL}/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `/api/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `http://localhost:8001/api/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `${API_GATEWAY_URL}/ais/api/products${categoryId ? `?category_id=${categoryId}` : ''}`,
        `${API_GATEWAY_URL}/api/products${categoryId ? `?category_id=${categoryId}` : ''}`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getProduct = async (id: number) => {
    const endpoints = [
        `${API_FULL_URL}/products/${id}`,
        `${API_BASE_URL}/products/${id}`,
        `/api/products/${id}`,
        `/products/${id}`,
        `http://localhost:8001/api/products/${id}`
    ];

    return trySeveralEndpoints(endpoints);
};

export const createProduct = async (productData: Partial<Product>) => {
    const endpoints = [
        `${API_FULL_URL}/products`,
        `${API_BASE_URL}/products`,
        `/api/products`,
        `/products`,
        `http://localhost:8001/api/products`
    ];

    return trySeveralEndpoints(endpoints, 'post', productData);
};

export const updateProduct = async (id: number, productData: Partial<Product>) => {
    const endpoints = [
        `${API_FULL_URL}/products/${id}`,
        `${API_BASE_URL}/products/${id}`,
        `/api/products/${id}`,
        `/products/${id}`,
        `http://localhost:8001/api/products/${id}`
    ];

    return trySeveralEndpoints(endpoints, 'put', productData);
};

export const deleteProduct = async (id: number) => {
    const endpoints = [
        `${API_FULL_URL}/products/${id}`,
        `${API_BASE_URL}/products/${id}`,
        `/api/products/${id}`,
        `/products/${id}`,
        `http://localhost:8001/api/products/${id}`
    ];

    return trySeveralEndpoints(endpoints, 'delete');
};

// API функции для категорий
export const getCategories = async () => {
    console.log("Fetching categories...");

    // Приоритет отдаем прямому URL к бэкенду с правильным окончанием "/"
    const endpoints = [
        `http://localhost:8001/api/categories/`,
        `${API_GATEWAY_URL}/ais/api/categories/`,
        `${API_FULL_URL}/categories/`,
        `${API_BASE_URL}/categories/`,
        `/api/categories/`,
        `/categories/`
    ];

    // Добавляем явный вывод токена для отладки
    const token = getAuthToken();
    console.log("Using auth token for categories:", token ? "Token present" : "No token");

    return trySeveralEndpoints(endpoints);
};

export const getCategory = async (id: number) => {
    const endpoints = [
        `${API_FULL_URL}/categories/${id}`,
        `${API_BASE_URL}/categories/${id}`,
        `/api/categories/${id}`,
        `/categories/${id}`,
        `http://localhost:8001/api/categories/${id}`
    ];

    return trySeveralEndpoints(endpoints);
};

// API функции для заказов
export const getOrders = async () => {
    const endpoints = [
        `${API_FULL_URL}/orders`,
        `${API_BASE_URL}/orders`,
        `/api/orders`,
        `/orders`,
        `http://localhost:8001/api/orders`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getOrder = async (id: number) => {
    const endpoints = [
        `${API_FULL_URL}/orders/${id}`,
        `${API_BASE_URL}/orders/${id}`,
        `/api/orders/${id}`,
        `/orders/${id}`,
        `http://localhost:8001/api/orders/${id}`
    ];

    return trySeveralEndpoints(endpoints);
};

// API функции для платежей
export const getPayments = async () => {
    const endpoints = [
        `${API_FULL_URL}/payments`,
        `${API_BASE_URL}/payments`,
        `/api/payments`,
        `/payments`,
        `http://localhost:8001/api/payments`
    ];

    return trySeveralEndpoints(endpoints);
};

// Дополнительные функции для склада
export const getStocks = async () => {
    const endpoints = [
        `${API_FULL_URL}/stocks`,
        `${API_BASE_URL}/stocks`,
        `/api/stocks`,
        `/stocks`,
        `http://localhost:8001/api/stocks`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getWarehouses = async () => {
    console.log("Fetching warehouses...");

    // Приоритет отдаем прямому URL к бэкенду с правильным окончанием "/"
    const endpoints = [
        `http://localhost:8001/api/warehouses/`,
        `${API_GATEWAY_URL}/ais/api/warehouses/`,
        `${API_FULL_URL}/warehouses/`,
        `${API_BASE_URL}/warehouses/`,
        `/api/warehouses/`,
        `/warehouses/`
    ];

    // Добавляем явный вывод токена для отладки
    const token = getAuthToken();
    console.log("Using auth token for warehouses:", token ? "Token present" : "No token");

    return trySeveralEndpoints(endpoints);
};

export const getSupplies = async () => {
    const endpoints = [
        `${API_FULL_URL}/supplies`,
        `${API_BASE_URL}/supplies`,
        `/api/supplies`,
        `/supplies`,
        `http://localhost:8001/api/supplies`
    ];

    return trySeveralEndpoints(endpoints);
};

export const getStockMovements = async () => {
    const endpoints = [
        `${API_FULL_URL}/stock-movements`,
        `${API_BASE_URL}/stock-movements`,
        `/api/stock-movements`,
        `/stock-movements`,
        `http://localhost:8001/api/stock-movements`
    ];

    return trySeveralEndpoints(endpoints);
};

// Вспомогательные функции для axios
export const createAuthenticatedAxios = () => {
    const token = getAuthToken();
    const instance = axios.create({
        headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 секунд таймаут
    });

    // Добавляем интерцептор для обработки ошибок
    instance.interceptors.response.use(
        response => response,
        error => {
            console.error('API Error:', error);

            // Если 401 - перенаправляем на логин
            if (error.response && error.response.status === 401) {
                clearAuthToken();
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

export const getAxiosAuthConfig = () => {
    const token = getAuthToken();
    return {
        headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
        },
        timeout: 15000
    };
};

// Текущие пользовательские данные
export const getCurrentDate = () => {
    return '2025-05-18 15:30:47'; // Фиксированная дата для демонстрации
};

export const getCurrentUser = () => {
    return 'katarymba'; // Фиксированный пользователь для демонстрации
};