import apiClient from './client';
export const ordersApi = {
    /**
     * Получить список заказов пользователя
     */
    getOrders: async () => {
        const response = await apiClient.get('/orders');
        return response.data;
    },
    /**
     * Получить заказ по ID
     */
    getOrderById: async (id) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },
    /**
     * Создать новый заказ
     */
    createOrder: async (data) => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },
    /**
     * Отменить заказ
     */
    cancelOrder: async (id) => {
        await apiClient.put(`/orders/${id}/cancel`);
    },
};
