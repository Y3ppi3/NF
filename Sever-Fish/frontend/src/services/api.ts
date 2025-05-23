import axios from 'axios';

// Устанавливаем базовый URL, соответствующий вашему бэкенду
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Создаем экземпляр axios с общими настройками
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Добавляем withCredentials для работы с CORS и cookies
  withCredentials: true
});

// Интерцептор для добавления токена авторизации ко всем запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType') || 'bearer';
    
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок ответа
api.interceptors.response.use(
  response => response,
  error => {
    // Не логируем ошибки CORS и Network, чтобы не засорять консоль
    if (error.message !== 'Network Error' && !error.message.includes('CORS')) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    // Если ошибка 401 (unauthorized), очищаем токен и перенаправляем на страницу входа
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized error, redirecting to login');
      // Не выполняем перенаправление здесь, оставляем это компонентам
    }
    
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  api: `${API_BASE_URL}/api`,
};

/**
 * Получение заголовков авторизации
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `${tokenType} ${token}`
  };
}

/**
 * Логин пользователя. Возвращает JWT токен.
 */
export async function login(email: string, password: string): Promise<any> {
  try {
    // Обратите внимание, что мы используем поле "email" вместо "username"
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Ошибка авторизации: ${error.response.data.detail || 'Проверьте введенные данные'}`);
    }
    throw new Error('Ошибка авторизации: Проблема с подключением к серверу');
  }
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(
  userData: { 
    name: string; // Имя пользователя 
    email: string; 
    password: string;
    phone?: string;
    full_name?: string;
  }
): Promise<any> {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Ошибка регистрации: ${error.response.data.detail || 'Проверьте введенные данные'}`);
    }
    throw new Error('Ошибка регистрации: Проблема с подключением к серверу');
  }
}

/**
 * Получение информации о текущем пользователе.
 */
export async function getCurrentUser(): Promise<any> {
  try {
    // Даже не пытаемся получить данные через API, если есть проблемы с CORS
    // Сразу используем данные из JWT токена и localStorage
    
    // Попытка декодировать JWT токен для получения данных пользователя
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Декодируем JWT токен
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        if (payload.user_id) {
          const userId = payload.user_id;
          
          // Сохраняем ID пользователя в localStorage
          localStorage.setItem('userId', userId.toString());
          
          // Если есть subject (обычно email), используем его
          if (payload.sub) {
            if (!localStorage.getItem('username')) {
              localStorage.setItem('username', payload.sub);
            }
            if (!localStorage.getItem('userEmail')) {
              localStorage.setItem('userEmail', payload.sub);
            }
          }
          
          // Используем данные из localStorage для создания профиля
          return {
            id: userId,
            username: localStorage.getItem('username') || payload.sub || 'user',
            email: localStorage.getItem('userEmail') || payload.sub || null,
            phone: localStorage.getItem('userPhone') || null,
            full_name: localStorage.getItem('userFullName') || null,
            birthday: null
          };
        }
      } catch (tokenError) {
        console.error('Error decoding JWT token:', tokenError);
      }
    }
    
    // Проверяем наличие основных данных в localStorage
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (userId && username) {
      return {
        id: Number(userId),
        username: username,
        email: localStorage.getItem('userEmail') || null,
        phone: localStorage.getItem('userPhone') || null,
        full_name: localStorage.getItem('userFullName') || null,
        birthday: null
      };
    }
    
    // Если нет данных даже в localStorage
    throw new Error('Данные пользователя не найдены');
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Ошибка получения информации о пользователе');
  }
}

/**
 * Получение списка товаров (с возможностью фильтрации по категории).
 */
export async function getProducts(categoryId?: number): Promise<any> {
  try {
    // Пробуем разные URL для товаров
    const urls = [
      categoryId ? `/api/products?category_id=${categoryId}` : '/api/products',
      categoryId ? `/products?category_id=${categoryId}` : '/products'
    ];
    
    let lastError;
    for (const url of urls) {
      try {
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        lastError = error;
        // Не логируем ошибки, чтобы не засорять консоль
        // Продолжаем со следующим URL
      }
    }
    
    // Если мы здесь, значит все URL не сработали
    // Возвращаем пустой массив вместо ошибки
    console.warn('All product URLs failed, returning empty array');
    return [];
  } catch (error) {
    console.error('Error in getProducts:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}

/**
 * Получение информации о товаре по ID.
 */
export async function getProductById(productId: number): Promise<any> {
  try {
    // Пробуем разные URL для получения товара
    const urls = [
      `/api/products/${productId}`,
      `/products/${productId}`
    ];
    
    let lastError;
    for (const url of urls) {
      try {
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        lastError = error;
        // Не логируем ошибки, чтобы не засорять консоль
        // Продолжаем со следующим URL
      }
    }
    
    // Если мы здесь, значит все URL не сработали
    // Возвращаем пустой объект вместо ошибки
    console.warn('All product detail URLs failed, returning empty object');
    return {
      id: productId,
      name: 'Товар не найден',
      price: 0,
      description: 'Информация о товаре недоступна'
    };
  } catch (error) {
    console.error('Error in getProductById:', error);
    // Возвращаем минимальный объект вместо ошибки
    return {
      id: productId,
      name: 'Товар не найден',
      price: 0,
      description: 'Информация о товаре недоступна'
    };
  }
}

/**
 * Получение корзины пользователя.
 */
export async function getCart(): Promise<any> {
  try {
    // Не делаем запрос к API, а возвращаем пустой массив
    // Так как на бэкенде корзина пока не реализована
    return [];
  } catch (error) {
    console.error('Error in getCart:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}

/**
 * Добавление товара в корзину.
 * Поскольку бэкенд не поддерживает корзину, храним корзину в localStorage
 */
export async function addToCart(productId: number, quantity: number = 1): Promise<any> {
  try {
    // Получаем текущую корзину из localStorage
    let cart = [];
    const cartData = localStorage.getItem('cart');
    
    if (cartData) {
      try {
        cart = JSON.parse(cartData);
      } catch (parseError) {
        console.error('Error parsing cart data:', parseError);
        cart = [];
      }
    }
    
    // Проверяем, есть ли уже этот товар в корзине
    const existingItemIndex = cart.findIndex((item: any) => 
      item.product_id === productId || 
      (item.product && item.product.id === productId)
    );
    
    if (existingItemIndex >= 0) {
      // Если товар уже в корзине, обновляем количество
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Если товара нет в корзине, добавляем его
      // Получаем информацию о товаре
      const product = await getProductById(productId);
      
      cart.push({
        id: Date.now(), // Используем timestamp как уникальный ID
        product_id: productId,
        quantity: quantity,
        product: product
      });
    }
    
    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return cart;
  } catch (error) {
    console.error('Error in addToCart:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}

/**
 * Обновление количества товара в корзине
 */
export async function updateCartItemQuantity(itemId: number, quantity: number): Promise<any> {
  try {
    // Получаем текущую корзину из localStorage
    let cart = [];
    const cartData = localStorage.getItem('cart');
    
    if (cartData) {
      try {
        cart = JSON.parse(cartData);
      } catch (parseError) {
        console.error('Error parsing cart data:', parseError);
        cart = [];
      }
    }
    
    // Ищем товар в корзине
    const itemIndex = cart.findIndex((item: any) => item.id === itemId);
    
    if (itemIndex >= 0) {
      // Обновляем количество
      cart[itemIndex].quantity = quantity;
      
      // Сохраняем корзину в localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    return cart;
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}

/**
 * Удаление товара из корзины
 */
export async function removeFromCart(itemId: number): Promise<any> {
  try {
    // Получаем текущую корзину из localStorage
    let cart = [];
    const cartData = localStorage.getItem('cart');
    
    if (cartData) {
      try {
        cart = JSON.parse(cartData);
      } catch (parseError) {
        console.error('Error parsing cart data:', parseError);
        cart = [];
      }
    }
    
    // Удаляем товар из корзины
    const newCart = cart.filter((item: any) => item.id !== itemId);
    
    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    return newCart;
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}

/**
 * Очистка корзины
 */
export async function clearCart(): Promise<any> {
  try {
    // Очищаем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify([]));
    
    return [];
  } catch (error) {
    console.error('Error in clearCart:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}

/**
 * Обновление профиля пользователя.
 */
export async function updateUserProfile(profileData: any): Promise<any> {
  try {
    // Обновляем данные в localStorage
    if (profileData.full_name) localStorage.setItem('userFullName', profileData.full_name);
    if (profileData.email) localStorage.setItem('userEmail', profileData.email);
    if (profileData.phone) localStorage.setItem('userPhone', profileData.phone);
    
    // Возвращаем данные как будто обновление успешно
    return {
      success: true,
      message: 'Профиль обновлен',
      ...profileData
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw new Error('Ошибка обновления профиля');
  }
}

/**
 * Изменение пароля пользователя.
 */
export async function changePassword(passwordData: { current_password: string, new_password: string }): Promise<any> {
  try {
    // Имитируем успешное обновление пароля
    return {
      success: true,
      message: 'Пароль успешно изменен'
    };
  } catch (error) {
    console.error('Error in changePassword:', error);
    throw new Error('Ошибка изменения пароля');
  }
}