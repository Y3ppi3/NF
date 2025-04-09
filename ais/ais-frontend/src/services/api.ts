// ais/ais-frontend/src/services/api.ts
export const API_BASE_URL = 'http://localhost:8080/ais';

const API_ENDPOINTS = {
    auth: `${API_BASE_URL}/auth`,
    admin: `${API_BASE_URL}/administrators`,
    api: `${API_BASE_URL}/api`,
};

export async function loginAsAdmin(username: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_ENDPOINTS.admin}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка авторизации администратора');
    }
    const data = await response.json();
    return data.access_token;
}

/**
 * Регистрация нового пользователя (только для админа).
 */
export async function registerUser(
    user: { username: string; email: string; password: string },
    token: string
): Promise<any> {
    const response = await fetch(`${API_ENDPOINTS.auth}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        throw new Error('Ошибка регистрации пользователя');
    }
    return await response.json();
}

/**
 * Получение информации о текущем пользователе.
 */
export async function getCurrentUser(token: string): Promise<any> {
    const response = await fetch(`${API_ENDPOINTS.auth}/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения информации о пользователе');
    }
    return await response.json();
}

/**
 * Получение списка товаров (с возможностью фильтрации по категории).
 */
export async function getProducts(url: string = '/products'): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}${url}`);
    if (!response.ok) {
        throw new Error('Ошибка получения товаров');
    }
    return await response.json();
}

/**
 * Получение списка категорий.
 */

interface Category {
    id: number;
    name: string;
    parent_category_id: number | null;
}

export async function getCategories(): Promise<Category[]> {
    try {
        const response = await fetch(`${API_ENDPOINTS}$categories}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', response.status, errorText);
            throw new Error(`Ошибка получения категорий: ${response.status}`);
        }

        const data = await response.json();
        console.log('Полученные категории:', data);
        return data;
    } catch (error) {
        console.error('Ошибка получения категорий:', error);
        throw error;
    }
}

/**
 * Получение списка заказов для текущего пользователя.
 */
export async function getOrders(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения заказов');
    }
    return await response.json();
}

/**
 * Получение списка платежей для текущего пользователя.
 */
export async function getPayments(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения платежей');
    }
    return await response.json();
}

/**
 * Получение списка доставок для текущего пользователя.
 */
export async function getShipments(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения доставок');
    }
    return await response.json();
}