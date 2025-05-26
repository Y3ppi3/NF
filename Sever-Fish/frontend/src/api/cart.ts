import apiClient from './client';
import { 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartSummary 
} from '../types/cart';

export const cartApi = {
  /**
   * Получить содержимое корзины
   */
  getCart: async (): Promise<CartSummary> => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  /**
   * Добавить товар в корзину
   */
  addToCart: async (data: AddToCartRequest): Promise<CartItem> => {
    const response = await apiClient.post('/cart', data);
    return response.data;
  },

  /**
   * Обновить количество товара в корзине
   */
  updateCartItem: async (
    productId: number,
    data: UpdateCartItemRequest
  ): Promise<CartItem> => {
    const response = await apiClient.put(`/cart/${productId}`, data);
    return response.data;
  },

  /**
   * Удалить товар из корзины
   */
  removeFromCart: async (productId: number): Promise<void> => {
    await apiClient.delete(`/cart/${productId}`);
  },

  /**
   * Очистить корзину
   */
  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },
};