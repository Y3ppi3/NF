import apiClient from './client';
import { 
  Order, 
  CreateOrderRequest 
} from '../types/orders';

export const ordersApi = {
  /**
   * Получить список заказов пользователя
   */
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  /**
   * Получить заказ по ID
   */
  getOrderById: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Создать новый заказ
   */
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  /**
   * Отменить заказ
   */
  cancelOrder: async (id: number): Promise<void> => {
    await apiClient.put(`/orders/${id}/cancel`);
  },
};