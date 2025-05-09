import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  TruckIcon,
  QrCodeIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  ArchiveBoxXMarkIcon,
  ArchiveBoxArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import '../styles/Warehouse.css';

// Import the three modules
import StockManagement from './warehouse/StockManagement';
import SupplyManagement from './warehouse/SupplyManagement';
import StockMovements from './warehouse/StockMovements';

// Import interfaces
import {
  Product,
  StockItem,
  Warehouse,
  Category,
  Shipment,
  ShipmentItem,
  StockMovement
} from './warehouse/interfaces';

// URL for API
import { API_BASE_URL as BASE_URL } from '../services/api';
const API_BASE_URL = `${BASE_URL}/api`;

// Helper functions
const getCurrentDateTime = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

const getCurrentUser = () => {
  return localStorage.getItem('currentUser') || 'katarymba';
};

// API key and URL for Север-Рыба
const SEVER_RYBA_API_URL = `http://localhost:8000`;
const SEVER_RYBA_API_KEY = localStorage.getItem('severRybaApiKey') || 'sr_api_key_2025';

const Warehouse: React.FC = () => {
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shipments' | 'movements'>('inventory');

  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Request to API to get data from real database
      const [
        productsResponse,
        stockResponse,
        warehousesResponse,
        categoriesResponse,
        shipmentsResponse,
        stockMovementsResponse
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/stocks`),
        axios.get(`${API_BASE_URL}/warehouses`),
        axios.get(`${API_BASE_URL}/categories`),
        axios.get(`${API_BASE_URL}/supplies`),
        axios.get(`${API_BASE_URL}/stock-movements`)
      ]);

      // Direct interaction with Север-Рыбой via API
      try {
        const severRybaResponse = await axios.get(`${SEVER_RYBA_API_URL}/inventory`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('severRybaToken')}`,
            'X-API-Key': SEVER_RYBA_API_KEY
          }
        });

        // Combine data from AIS and Север-Рыба
        const combinedProducts = mergeProductData(
            productsResponse.data,
            severRybaResponse.data.products,
            categoriesResponse.data
        );

        setProducts(combinedProducts);
      } catch (syncError) {
        console.error("Failed to sync with Север-Рыба:", syncError);
        // Use only data from our system
        setProducts(productsResponse.data);
      }

      setStockItems(stockResponse.data);
      setWarehouses(warehousesResponse.data);
      setCategories(categoriesResponse.data);
      setShipments(shipmentsResponse.data);
      setStockMovements(stockMovementsResponse.data);

      setError(null);
    } catch (err) {
      console.error("Failed to fetch warehouse data:", err);
      setError("Не удалось загрузить данные склада.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component load
  useEffect(() => {
    fetchData();
  }, []);

  // Function to merge product data from different sources
  const mergeProductData = (aisProducts: Product[], severRybaProducts: any[], categoriesList: Category[]) => {
    // If there's no data from Север-Рыба, return AIS data
    if (!severRybaProducts || !severRybaProducts.length) {
      return aisProducts;
    }

    // Map for quick product search by SKU
    const productMap = new Map();
    aisProducts.forEach(product => {
      productMap.set(product.sku, product);
    });

    // Function to find category ID by name
    const findCategoryId = (categoryName: string) => {
      const category = categoriesList.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      return category ? category.id : '1'; // Return default ID if category not found
    };

    // Update or add products from Север-Рыба
    severRybaProducts.forEach(srProduct => {
      if (productMap.has(srProduct.sku)) {
        // Update existing product
        const existingProduct = productMap.get(srProduct.sku);
        existingProduct.price = srProduct.price || existingProduct.price;
        existingProduct.updated_at = srProduct.last_updated || existingProduct.updated_at;
        existingProduct.sr_stock_quantity = srProduct.quantity || 0;
        existingProduct.sr_sync = true;
      } else {
        // Add new product from Север-Рыба
        productMap.set(srProduct.sku, {
          id: `SR-${srProduct.id}`,
          sku: srProduct.sku,
          name: srProduct.name,
          category_id: findCategoryId(srProduct.category),
          category_name: srProduct.category,
          unit: srProduct.unit || 'шт',
          price: srProduct.price || 0,
          is_active: true,
          created_at: srProduct.created || new Date().toISOString(),
          updated_at: srProduct.last_updated || new Date().toISOString(),
          supplier: 'Север-Рыба',
          image_url: srProduct.image || '',
          sr_stock_quantity: srProduct.quantity || 0,
          sr_sync: true
        });
      }
    });

    return Array.from(productMap.values());
  };

  // Function to sync data with Север-Рыба
  const syncWithSeverRyba = async () => {
    setIsLoading(true);
    try {
      // Get actual data from Север-Рыба
      const severRybaResponse = await axios.get(`${SEVER_RYBA_API_URL}/inventory`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('severRybaToken')}`,
          'X-API-Key': SEVER_RYBA_API_KEY
        }
      });

      // Get actual data from our DB
      const productsResponse = await axios.get(`${API_BASE_URL}/products`);

      // Combine data
      const combinedProducts = mergeProductData(
          productsResponse.data,
          severRybaResponse.data.products,
          categories
      );

      // Update products that have changed
      for (const product of combinedProducts) {
        if (product.sr_sync) {
          await axios.put(`${API_BASE_URL}/products/${product.id}`, {
            price: product.price,
            updated_at: new Date().toISOString()
          });

          // If we have stock in our system but it's not in Север-Рыба
          // or vice versa - create or update records
          if (product.sr_stock_quantity !== undefined) {
            const stockItem = stockItems.find(item =>
                item.product_id === product.id &&
                item.warehouse_id === '1' // Assume the main warehouse has ID 1
            );

            if (stockItem) {
              // Update existing stock record
              await axios.patch(`${API_BASE_URL}/stocks/${stockItem.id}`, {
                quantity: product.sr_stock_quantity,
                last_count_date: new Date().toISOString(),
                last_counted_by: 'Север-Рыба Sync',
                status: determineStockStatus(product.sr_stock_quantity, stockItem.minimum_quantity)
              });

              // Create stock movement record
              await axios.post(`${API_BASE_URL}/stock-movements`, {
                product_id: product.id,
                warehouse_id: '1',
                quantity: product.sr_stock_quantity - stockItem.quantity,
                previous_quantity: stockItem.quantity,
                movement_type: 'adjustment',
                performed_by: 'Север-Рыба Sync',
                movement_date: new Date().toISOString(),
                notes: 'Автоматическая синхронизация с Север-Рыба'
              });
            } else {
              // Create new stock record
              await axios.post(`${API_BASE_URL}/stocks`, {
                product_id: product.id,
                warehouse_id: '1',
                quantity: product.sr_stock_quantity,
                minimum_quantity: 5, // Default value
                reorder_level: 10, // Default value
                status: determineStockStatus(product.sr_stock_quantity, 5),
                last_count_date: new Date().toISOString(),
                last_counted_by: 'Север-Рыба Sync'
              });

              // Create stock movement record
              await axios.post(`${API_BASE_URL}/stock-movements`, {
                product_id: product.id,
                warehouse_id: '1',
                quantity: product.sr_stock_quantity,
                previous_quantity: 0,
                movement_type: 'receipt',
                performed_by: 'Север-Рыба Sync',
                movement_date: new Date().toISOString(),
                notes: 'Первоначальное добавление через синхронизацию с Север-Рыба'
              });
            }
          }
        }
      }

      // Update page data
      fetchData();

      alert('Синхронизация с Север-Рыба выполнена успешно!');
    } catch (err) {
      console.error("Ошибка при синхронизации с Север-Рыба:", err);
      alert('Не удалось выполнить синхронизацию с Север-Рыба. Пожалуйста, проверьте подключение и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine stock status
  const determineStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity < minQuantity) return 'low-stock';
    return 'in-stock';
  };

  // Calculate warehouse stats
  const warehouseStats = useMemo(() => {
    if (!stockItems.length) return {
      totalProducts: 0,
      totalItems: 0,
      totalValue: 0,
      totalValueBySR: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      pendingSyncItems: 0
    };

    // Calculate stats and total value
    let totalValue = 0;
    let totalValueBySR = 0;
    let pendingSyncItems = 0;

    // Create Map for quick product lookup
    const productMap = new Map();
    products.forEach(p => productMap.set(p.id, p));

    // Calculate total warehouse value considering data from both sources
    stockItems.forEach(item => {
      const product = productMap.get(item.product_id);
      if (product) {
        // Regular value based on AIS data
        totalValue += item.quantity * product.price;

        // Value considering Север-Рыба prices, if available
        const srPrice = product.sr_sync ? (product.price || 0) : 0;
        totalValueBySR += item.quantity * (srPrice || product.price);

        // Count items without sync
        if (!product.sr_sync) {
          pendingSyncItems++;
        }
      }
    });

    return {
      totalProducts: products.length,
      totalItems: stockItems.length,
      totalValue: parseFloat(totalValue.toFixed(2)), // Round for precision
      totalValueBySR: parseFloat(totalValueBySR.toFixed(2)),
      lowStockItems: stockItems.filter(item => item.status === 'low-stock').length,
      outOfStockItems: stockItems.filter(item => item.status === 'out-of-stock').length,
      pendingSyncItems
    };
  }, [stockItems, products]);

  return (
      <div className="container mx-auto p-4">
        {/* Header and action buttons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Склад</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Управление складскими запасами и поставками
            </p>
          </div>

          <div className="flex space-x-2">
            <button
                onClick={syncWithSeverRyba}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              Синхронизация с Север-Рыба
            </button>
          </div>
        </div>

        {/* Cards with general statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Всего наименований</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{warehouseStats.totalProducts}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">В каталоге товаров</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Всего складских позиций</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{warehouseStats.totalItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">На всех складах</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Общая стоимость</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2
              }).format(warehouseStats.totalValue)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">По данным АИС</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Стоимость по Север-Рыба</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2
              }).format(warehouseStats.totalValueBySR)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">С учетом цен поставщика</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Заканчиваются</div>
            <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mt-1">{warehouseStats.lowStockItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Требуется пополнение</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Несинхронизировано</div>
            <div className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{warehouseStats.pendingSyncItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Требуется синхронизация</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'inventory'
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
            >
              Складской учет
            </button>

            <button
                onClick={() => setActiveTab('shipments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'shipments'
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
            >
              Поставки
            </button>

            <button
                onClick={() => setActiveTab('movements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'movements'
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
            >
              Движение товаров
            </button>
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'inventory' && (
            <StockManagement
                isLoading={isLoading}
                products={products}
                stockItems={stockItems}
                warehouses={warehouses}
                categories={categories}
                fetchData={fetchData}
                API_BASE_URL={API_BASE_URL}
                getCurrentDateTime={getCurrentDateTime}
                getCurrentUser={getCurrentUser}
                determineStockStatus={determineStockStatus}
            />
        )}

        {activeTab === 'shipments' && (
            <SupplyManagement
                isLoading={isLoading}
                products={products}
                shipments={shipments}
                warehouses={warehouses}
                fetchData={fetchData}
                API_BASE_URL={API_BASE_URL}
                getCurrentDateTime={getCurrentDateTime}
                getCurrentUser={getCurrentUser}
            />
        )}

        {activeTab === 'movements' && (
            <StockMovements
                isLoading={isLoading}
                products={products}
                stockItems={stockItems}
                warehouses={warehouses}
                stockMovements={stockMovements}
                fetchData={fetchData}
                API_BASE_URL={API_BASE_URL}
                getCurrentDateTime={getCurrentDateTime}
                getCurrentUser={getCurrentUser}
            />
        )}

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <div>
              <p>Система управления складскими запасами</p>
            </div>
            <div className="text-right">
              <p>Последнее обновление: {getCurrentDateTime()}</p>
              <p>Пользователь: {getCurrentUser()}</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Warehouse;