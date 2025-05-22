import apiClient from './client';
export const cartApi = {
    /**
     * Получить содержимое корзины
     */
    getCart: async () => {
        const response = await apiClient.get('/cart');
        return response.data;
    },
    /**
     * Добавить товар в корзину
     */
    addToCart: async (data) => {
        const response = await apiClient.post('/cart', data);
        return response.data;
    },
    /**
     * Обновить количество товара в корзине
     */
    updateCartItem: async (productId, data) => {
        const response = await apiClient.put(`/cart/${productId}`, data);
        return response.data;
    },
    /**
     * Удалить товар из корзины
     */
    removeFromCart: async (productId) => {
        await apiClient.delete(`/cart/${productId}`);
    },
    /**
     * Очистить корзину
     */
    clearCart: async () => {
        await apiClient.delete('/cart');
    },
};
