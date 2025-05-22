import apiClient from './client';
export const productsApi = {
    /**
     * Получить список всех товаров с фильтрацией и пагинацией
     */
    getProducts: async (filters, page = 1, limit = 12) => {
        const response = await apiClient.get('/products', {
            params: {
                ...filters,
                skip: (page - 1) * limit,
                limit,
            },
        });
        return response.data;
    },
    /**
     * Получить товар по ID
     */
    getProductById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },
    /**
     * Получить список всех категорий
     */
    getCategories: async () => {
        const response = await apiClient.get('/products/categories');
        return response.data;
    },
    /**
     * Получить категорию по ID
     */
    getCategoryById: async (id) => {
        const response = await apiClient.get(`/products/categories/${id}`);
        return response.data;
    },
    /**
     * Получить товары по категории
     */
    getProductsByCategory: async (categoryId, page = 1, limit = 12) => {
        const response = await apiClient.get(`/products/categories/${categoryId}/products`, {
            params: {
                skip: (page - 1) * limit,
                limit,
            },
        });
        return response.data;
    },
};
