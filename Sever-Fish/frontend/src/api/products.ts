import apiClient from './client';
import { 
  Product, 
  Category, 
  ProductFilter, 
  PaginatedResponse 
} from '../types/products';

export const productsApi = {
  /**
   * Получить список всех товаров с фильтрацией и пагинацией
   */
  getProducts: async (
    filters?: ProductFilter,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Product>> => {
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
  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Получить список всех категорий
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },

  /**
   * Получить категорию по ID
   */
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/products/categories/${id}`);
    return response.data;
  },

  /**
   * Получить товары по категории
   */
  getProductsByCategory: async (
    categoryId: number,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get(`/products/categories/${categoryId}/products`, {
      params: {
        skip: (page - 1) * limit,
        limit,
      },
    });
    return response.data;
  },
};