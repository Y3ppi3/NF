import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, REQUEST_CONFIG, Storage } from '../utils/apiConfig';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../utils/fallbackData';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_CONFIG.timeout,
  headers: REQUEST_CONFIG.headers
});

// Глобальное состояние автономного режима
let offlineMode = false;

// Перехватчик запросов для добавления токена аутентификации
api.interceptors.request.use(
  (config) => {
    const token = Storage.getToken();
    const tokenType = Storage.getTokenType();
    
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов для обработки ошибок аутентификации
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Если получили 401 - Unauthorized, очищаем данные авторизации
    if (error.response?.status === 401) {
      Storage.clearAuthData();
      console.warn('Ошибка авторизации, требуется повторный вход');
      
      // Сохраняем текущий путь для перенаправления после авторизации
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth') {
        Storage.setRedirectPath(currentPath);
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Функция для попытки запроса по нескольким URL с автоматическим переходом в автономный режим при неудаче
 * @param endpoints Массив URL для попыток запроса
 * @param method HTTP метод запроса
 * @param data Данные для отправки (для POST, PUT)
 * @param fallbackData Данные для возврата в автономном режиме
 */
async function tryEndpoints<T>(
  endpoints: string[],
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  data?: any,
  fallbackData?: T
): Promise<T> {
  // Если уже в автономном режиме и есть данные для автономного режима, возвращаем их
  if (offlineMode && fallbackData !== undefined) {
    return fallbackData;
  }
  
  // Если в автономном режиме, но нет данных - выбрасываем ошибку
  if (offlineMode && fallbackData === undefined) {
    throw new Error('Операция недоступна в автономном режиме');
  }
  
  // Опции запроса
  const options: AxiosRequestConfig = {};
  
  // Перебираем все указанные эндпоинты
  for (const endpoint of endpoints) {
    try {
      console.log(`Попытка ${method.toUpperCase()} запроса к ${endpoint}`);
      
      let response: AxiosResponse;
      
      switch (method) {
        case 'get':
          response = await api.get(endpoint, options);
          break;
        case 'post':
          response = await api.post(endpoint, data, options);
          break;
        case 'put':
          response = await api.put(endpoint, data, options);
          break;
        case 'delete':
          response = await api.delete(endpoint, options);
          break;
      }
      
      console.log(`Успешный ответ от ${endpoint}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Ошибка при ${method.toUpperCase()} запросе к ${endpoint}:`, error);
      
      // Продолжаем пробовать следующий эндпоинт, если текущий не сработал
    }
  }
  
  // Если все попытки не удались, но есть данные для автономного режима
  if (fallbackData !== undefined) {
    console.warn('Все попытки запроса не удались, переход в автономный режим');
    setOfflineMode(true);
    return fallbackData;
  }
  
  // Если нет данных для автономного режима, выбрасываем ошибку
  throw new Error(`Не удалось выполнить запрос, все эндпоинты недоступны`);
}

// Публичный API для управления автономным режимом
export function isOfflineMode(): boolean {
  return offlineMode;
}

export function setOfflineMode(enable: boolean): void {
  offlineMode = enable;
  console.log(`Автономный режим ${enable ? 'включен' : 'выключен'}`);
}

/**
 * Проверка здоровья API
 */
export async function checkApiHealth() {
  try {
    const result = await tryEndpoints<{status: string, message?: string}>(
      API_ENDPOINTS.health,
      'get',
      undefined,
      { status: 'offline', message: 'Автономный режим активен' }
    );
    
    // Если получили ответ от API, выходим из автономного режима
    if (result.status === 'ok') {
      setOfflineMode(false);
    }
    
    return result;
  } catch (error) {
    console.error('Ошибка при проверке здоровья API:', error);
    setOfflineMode(true);
    return { status: 'error', message: 'Не удалось проверить состояние API' };
  }
}

/**
 * Функции для работы с категориями
 */
export async function getCategories() {
  return tryEndpoints<any[]>(
    API_ENDPOINTS.categories, 
    'get', 
    undefined, 
    FALLBACK_CATEGORIES
  );
}

/**
 * Функции для работы с товарами
 */
export async function getProducts() {
  return tryEndpoints<any[]>(
    API_ENDPOINTS.products, 
    'get', 
    undefined, 
    FALLBACK_PRODUCTS
  );
}

export async function getProductsByCategory(categoryId: number | string) {
  const endpoints = API_ENDPOINTS.products.map(endpoint => 
    `${endpoint}/category/${categoryId}`
  );
  
  // Для автономного режима фильтруем локальные данные
  const offlineData = FALLBACK_PRODUCTS.filter(
    p => p.category_id.toString() === categoryId.toString()
  );
  
  return tryEndpoints<any[]>(endpoints, 'get', undefined, offlineData);
}

export async function getProductById(productId: number | string) {
  const endpoints = API_ENDPOINTS.products.map(endpoint => 
    `${endpoint}/${productId}`
  );
  
  // Для автономного режима находим товар в локальных данных
  const offlineProduct = FALLBACK_PRODUCTS.find(
    p => p.id.toString() === productId.toString()
  );
  
  return tryEndpoints<any>(endpoints, 'get', undefined, offlineProduct);
}

/**
 * Функции для работы с корзиной
 */
export async function getCart() {
  // Для автономного режима возвращаем пустую корзину
  const emptyCart = { items: [], total_items: 0, total_amount: 0 };
  
  return tryEndpoints<any>(API_ENDPOINTS.cart, 'get', undefined, emptyCart);
}

export async function addToCart(data: { product_id: number, quantity: number }) {
  return tryEndpoints<any>(
    API_ENDPOINTS.cart, 
    'post', 
    data, 
    { success: true, message: 'Товар добавлен в корзину (автономный режим)' }
  );
}

export async function updateCartItem(itemId: number, data: { quantity: number }) {
  const endpoints = API_ENDPOINTS.cart.map(endpoint => `${endpoint}/${itemId}`);
  
  return tryEndpoints<any>(
    endpoints, 
    'put', 
    data, 
    { success: true, message: 'Количество товара изменено (автономный режим)' }
  );
}

export async function removeFromCart(itemId: number) {
  const endpoints = API_ENDPOINTS.cart.map(endpoint => `${endpoint}/${itemId}`);
  
  return tryEndpoints<any>(
    endpoints, 
    'delete', 
    undefined, 
    { success: true, message: 'Товар удален из корзины (автономный режим)' }
  );
}

/**
 * Функции для авторизации
 */
export async function login(credentials: { username: string, password: string }) {
  try {
    // В автономном режиме имитируем вход для демо пользователя
    if (offlineMode) {
      if (credentials.username === 'demo' && credentials.password === 'demo') {
        const userData = {
          id: 1,
          username: 'demo',
          email: 'demo@example.com',
          is_active: true,
          is_admin: false
        };
        
        const token = `offline_token_${Date.now()}`;
        
        Storage.setToken(token);
        Storage.setTokenType('Bearer');
        Storage.setUserId(userData.id.toString());
        Storage.setUsername(userData.username);
        
        return {
          access_token: token,
          token_type: 'Bearer',
          user: userData
        };
      } else {
        throw new Error('В автономном режиме используйте учетные данные: demo/demo');
      }
    }
    
    // Запрос к API для авторизации
    const response = await tryEndpoints<any>(API_ENDPOINTS.auth, 'post', credentials);
    
    // Сохраняем данные авторизации
    Storage.setToken(response.access_token);
    Storage.setTokenType(response.token_type);
    Storage.setUserId(response.user.id.toString());
    Storage.setUsername(response.user.username);
    
    return response;
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    throw error;
  }
}

export async function register(userData: { 
  username: string, 
  email: string, 
  password: string,
  full_name?: string
}) {
  if (offlineMode) {
    throw new Error('Регистрация недоступна в автономном режиме');
  }
  
  try {
    const response = await tryEndpoints<any>(API_ENDPOINTS.register, 'post', userData);
    
    // Сохраняем данные авторизации
    Storage.setToken(response.access_token);
    Storage.setTokenType(response.token_type);
    Storage.setUserId(response.user.id.toString());
    Storage.setUsername(response.user.username);
    
    return response;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
}

export function logout() {
  Storage.clearAuthData();
  window.location.href = '/';
}

/**
 * Функции для работы с заказами
 */
export async function createOrder(orderData: {
  delivery_address: string;
  phone: string;
  delivery_date?: string;
  notes?: string;
}) {
  // В автономном режиме имитируем создание заказа
  const offlineOrder = {
    id: Date.now(),
    status: 'pending',
    total_amount: 0,
    user_id: Storage.getUserId() ? parseInt(Storage.getUserId() as string) : 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [],
    ...orderData
  };
  
  return tryEndpoints<any>(API_ENDPOINTS.orders, 'post', orderData, offlineOrder);
}

export async function getOrders() {
  // В автономном режиме возвращаем пустой список заказов
  return tryEndpoints<any[]>(API_ENDPOINTS.orders, 'get', undefined, []);
}

export async function getOrderById(orderId: number) {
  const endpoints = API_ENDPOINTS.orders.map(endpoint => `${endpoint}/${orderId}`);
  
  // В автономном режиме возвращаем заглушку заказа
  const offlineOrder = {
    id: orderId,
    status: 'pending',
    total_amount: 0,
    user_id: Storage.getUserId() ? parseInt(Storage.getUserId() as string) : 1,
    delivery_address: 'Адрес недоступен в автономном режиме',
    phone: 'Телефон недоступен в автономном режиме',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: []
  };
  
  return tryEndpoints<any>(endpoints, 'get', undefined, offlineOrder);
}

// Дополнительные вспомогательные функции
export function isAuthenticated(): boolean {
  return !!Storage.getToken();
}

export default api;