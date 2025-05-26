import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

// URL для API интеграции AIS
const AIS_API_URL = 'http://127.0.0.1:8001';

// Функция для проверки доступности API AIS
export const checkAisConnection = async () => {
  try {
    const response = await axios.get(`${AIS_API_URL}/health`, { 
      timeout: 5000 
    });
    return response.data?.status === 'ok';
  } catch (error) {
    console.error('Ошибка при проверке API AIS:', error);
    return false;
  }
};

// Функция для синхронизации категорий
export const syncCategories = async () => {
  try {
    // Запрос категорий из AIS
    const aisResponse = await axios.get(`${AIS_API_URL}/categories`);
    const aisCategories = aisResponse.data;
    
    // Отправка категорий в основное API Север-Рыба
    const syncResponse = await api.post(`${API_BASE_URL}/api/sync/categories`, {
      categories: aisCategories
    });
    
    return syncResponse.data;
  } catch (error) {
    console.error('Ошибка при синхронизации категорий:', error);
    throw error;
  }
};

// Функция для синхронизации продуктов
export const syncProducts = async () => {
  try {
    // Запрос продуктов из AIS
    const aisResponse = await axios.get(`${AIS_API_URL}/products`);
    const aisProducts = aisResponse.data;
    
    // Отправка продуктов в основное API Север-Рыба
    const syncResponse = await api.post(`${API_BASE_URL}/api/sync/products`, {
      products: aisProducts
    });
    
    return syncResponse.data;
  } catch (error) {
    console.error('Ошибка при синхронизации продуктов:', error);
    throw error;
  }
};

// Функция для синхронизации заказов
export const syncOrders = async () => {
  try {
    // Запрос заказов из основного API Север-Рыба
    const northFishOrders = await api.get(`${API_BASE_URL}/api/orders`);
    
    // Отправка заказов в AIS
    const syncResponse = await axios.post(`${AIS_API_URL}/sync/orders`, {
      orders: northFishOrders.data
    });
    
    return syncResponse.data;
  } catch (error) {
    console.error('Ошибка при синхронизации заказов:', error);
    throw error;
  }
};

// Основная функция для полной синхронизации
export const runFullSync = async () => {
  console.log('Начало полной синхронизации с AIS');
  
  try {
    // Проверяем соединение с AIS
    const aisAvailable = await checkAisConnection();
    if (!aisAvailable) {
      throw new Error('API AIS недоступно');
    }
    
    // Выполняем синхронизацию в нужном порядке
    await syncCategories();
    console.log('Категории успешно синхронизированы');
    
    await syncProducts();
    console.log('Товары успешно синхронизированы');
    
    await syncOrders();
    console.log('Заказы успешно синхронизированы');
    
    console.log('Полная синхронизация с AIS успешно завершена');
    return { success: true, message: 'Синхронизация успешно завершена' };
  } catch (error) {
    console.error('Ошибка при выполнении полной синхронизации:', error);
    throw error;
  }
};

export default {
  checkAisConnection,
  syncCategories,
  syncProducts,
  syncOrders,
  runFullSync
};