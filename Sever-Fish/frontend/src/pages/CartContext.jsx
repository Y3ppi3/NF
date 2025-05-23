import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

// Определяем интерфейсы для типизации данных
interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  weight?: string;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateCartItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Создаем контекст с начальным значением по умолчанию
const CartContext = createContext<CartContextType | undefined>(undefined);

// Создаем провайдер контекста
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка корзины при монтировании компонента
  useEffect(() => {
    refreshCart();
  }, []);

  // Функция для обновления корзины
  const refreshCart = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Пытаемся получить корзину из localStorage
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        try {
          const parsedCart = JSON.parse(cartData);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error('Ошибка при парсинге корзины из localStorage:', e);
        }
      }

      // Если не удалось получить из localStorage, пробуем API
      const token = localStorage.getItem('token');
      if (!token) {
        // Если пользователь не авторизован, просто используем пустую корзину
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart`, {
          headers: { 
            'Authorization': `${localStorage.getItem('tokenType') || 'Bearer'} ${token}` 
          }
        });

        // Обработка ответа API
        const data = response.data;
        
        if (Array.isArray(data)) {
          // Если это массив, используем его напрямую
          setCartItems(data);
        } else if (data && typeof data === 'object') {
          // Если это объект, проверяем наличие массива cart_items или items
          if (Array.isArray(data.items)) {
            setCartItems(data.items);
          } else if (Array.isArray(data.cart_items)) {
            setCartItems(data.cart_items);
          } else {
            console.log("Неожиданный формат данных корзины:", data);
            setCartItems([]);
          }
        } else {
          // Если формат данных не распознан, устанавливаем пустую корзину
          console.log("Неожиданный формат данных корзины:", data);
          setCartItems([]);
        }
      } catch (error) {
        console.error("Ошибка при получении корзины из API:", error);
        // В случае ошибки API используем пустую корзину
        setCartItems([]);
      }
    } catch (error) {
      console.error("Ошибка при обновлении корзины:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление товара в корзину
  const addToCart = async (productId: number, quantity: number = 1): Promise<void> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Получаем информацию о товаре
      const productResponse = await axios.get(`${API_BASE_URL}/api/products/${productId}`);
      const product = productResponse.data;
      
      // Проверяем, есть ли уже товар в корзине
      const existingItemIndex = cartItems.findIndex(
        item => item.product_id === productId || (item.product && item.product.id === productId)
      );
      
      let updatedCart: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Если товар уже есть, обновляем количество
        updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        // Если товара нет, добавляем новый элемент
        const newItem: CartItem = {
          id: Date.now(), // Используем timestamp как временный ID
          product_id: productId,
          quantity: quantity,
          product: product
        };
        
        updatedCart = [...cartItems, newItem];
      }
      
      // Сохраняем корзину в localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Обновляем состояние
      setCartItems(updatedCart);
      
      // Если пользователь авторизован, пробуем отправить данные на сервер
      if (token) {
        try {
          await axios.post(`${API_BASE_URL}/api/cart/add`, {
            product_id: productId,
            quantity: quantity
          }, {
            headers: { 
              'Authorization': `${localStorage.getItem('tokenType') || 'Bearer'} ${token}` 
            }
          });
        } catch (apiError) {
          console.error("Ошибка при добавлении товара в корзину на сервере:", apiError);
          // В случае ошибки API, мы все равно используем локальное состояние
        }
      }
    } catch (error) {
      console.error("Ошибка при добавлении товара в корзину:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление товара из корзины
  const removeFromCart = async (itemId: number): Promise<void> => {
    setIsLoading(true);
    try {
      // Фильтруем элементы корзины, исключая товар с указанным id
      const updatedCart = cartItems.filter(item => item.id !== itemId);
      
      // Сохраняем корзину в localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Обновляем состояние
      setCartItems(updatedCart);
      
      // Если пользователь авторизован, пробуем отправить данные на сервер
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.delete(`${API_BASE_URL}/api/cart/items/${itemId}`, {
            headers: { 
              'Authorization': `${localStorage.getItem('tokenType') || 'Bearer'} ${token}` 
            }
          });
        } catch (apiError) {
          console.error("Ошибка при удалении товара из корзины на сервере:", apiError);
          // В случае ошибки API, мы все равно используем локальное состояние
        }
      }
    } catch (error) {
      console.error("Ошибка при удалении товара из корзины:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление количества товара в корзине
  const updateCartItemQuantity = async (itemId: number, quantity: number): Promise<void> => {
    setIsLoading(true);
    try {
      if (quantity < 1) {
        // Если количество меньше 1, удаляем товар из корзины
        await removeFromCart(itemId);
        return;
      }
      
      // Находим элемент корзины и обновляем его количество
      const updatedCart = cartItems.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });
      
      // Сохраняем корзину в localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Обновляем состояние
      setCartItems(updatedCart);
      
      // Если пользователь авторизован, пробуем отправить данные на сервер
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.put(`${API_BASE_URL}/api/cart/items/${itemId}`, {
            quantity: quantity
          }, {
            headers: { 
              'Authorization': `${localStorage.getItem('tokenType') || 'Bearer'} ${token}` 
            }
          });
        } catch (apiError) {
          console.error("Ошибка при обновлении количества товара в корзине на сервере:", apiError);
          // В случае ошибки API, мы все равно используем локальное состояние
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении количества товара в корзине:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Очистка корзины
  const clearCart = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Очищаем корзину в localStorage
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Обновляем состояние
      setCartItems([]);
      
      // Если пользователь авторизован, пробуем отправить данные на сервер
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.delete(`${API_BASE_URL}/api/cart`, {
            headers: { 
              'Authorization': `${localStorage.getItem('tokenType') || 'Bearer'} ${token}` 
            }
          });
        } catch (apiError) {
          console.error("Ошибка при очистке корзины на сервере:", apiError);
          // В случае ошибки API, мы все равно используем локальное состояние
        }
      }
    } catch (error) {
      console.error("Ошибка при очистке корзины:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Предоставляем значение контекста
  const contextValue: CartContextType = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Хук для использования контекста корзины
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};