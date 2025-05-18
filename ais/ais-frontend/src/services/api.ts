import { getAuthToken, clearAuthToken } from './auth';
import axios from 'axios';

// Базовый URL API Gateway
export const API_BASE_URL = '/ais';
export const API_FULL_URL = `${API_BASE_URL}/api`;

// Типы для API данных
export interface Product { /* ... */ }
export interface Category { /* ... */ }
export interface Order { /* ... */ }
export interface OrderItem { /* ... */ }

// Функции для работы с API
export class APIError extends Error { /* ... */ }

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => { /* ... */ };

// --- axios helpers ---
export const createAuthenticatedAxios = () => {
    const token = getAuthToken();
    const instance = axios.create({
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
        },
    });
    return instance;
};

export const getAxiosAuthConfig = () => {
    const token = getAuthToken();
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
        },
    };
};

// API функции для продуктов
export const getProducts = async () => fetchWithAuth('/api/products');
export const getProduct = async (id: number) => fetchWithAuth(`/api/products/${id}`);
export const createProduct = async (productData: Partial<Product>) =>
    fetchWithAuth('/api/products', { method: 'POST', body: JSON.stringify(productData) });
export const updateProduct = async (id: number, productData: Partial<Product>) =>
    fetchWithAuth(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) });
export const deleteProduct = async (id: number) =>
    fetchWithAuth(`/api/products/${id}`, { method: 'DELETE' });

// API функции для категорий
export const getCategories = async () => fetchWithAuth('/api/categories');
export const getCategory = async (id: number) => fetchWithAuth(`/api/categories/${id}`);
export const createCategory = async (categoryData: Partial<Category>) =>
    fetchWithAuth('/api/categories', { method: 'POST', body: JSON.stringify(categoryData) });
export const updateCategory = async (id: number, categoryData: Partial<Category>) =>
    fetchWithAuth(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(categoryData) });
export const deleteCategory = async (id: number) =>
    fetchWithAuth(`/api/categories/${id}`, { method: 'DELETE' });

// API функции для заказов
export const getOrders = async () => fetchWithAuth('/api/orders');
export const getOrder = async (id: number) => fetchWithAuth(`/api/orders/${id}`);
export const createOrder = async (orderData: Partial<Order>) =>
    fetchWithAuth('/api/orders', { method: 'POST', body: JSON.stringify(orderData) });
export const updateOrder = async (id: number, orderData: Partial<Order>) =>
    fetchWithAuth(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(orderData) });
export const deleteOrder = async (id: number) =>
    fetchWithAuth(`/api/orders/${id}`, { method: 'DELETE' });

// API функции для платежей
export const getPayments = async () => fetchWithAuth('/api/payments');

// --- Дополнительные функции для склада, поставок, движения товаров ---
export const getStocks = async () => fetchWithAuth('/api/stocks');
export const getWarehouses = async () => fetchWithAuth('/api/warehouses');
export const getSupplies = async () => fetchWithAuth('/api/supplies');
export const getStockMovements = async () => fetchWithAuth('/api/stock-movements');