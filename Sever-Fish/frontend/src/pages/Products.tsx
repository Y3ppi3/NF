import React, { useEffect, useState, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { ProductFilter } from '../types/products';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, loading, error, getProducts, getCategories } = useProducts();
  const { getCart } = useCart();
  
  // Состояние для фильтров
  const [filter, setFilter] = useState<ProductFilter>({
    category_id: searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    in_stock: searchParams.get('in_stock') === 'true'
  });

  // Загружаем товары и категории при монтировании компонента
  useEffect(() => {
    getProducts(filter);
    getCategories();
    getCart();
  }, [getProducts, getCategories, getCart]);

  // Обработчик изменения фильтров
  const handleFilterChange = (name: string, value: string | number | boolean) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Применение фильтров
  const applyFilters = () => {
    // Обновляем URL с новыми параметрами фильтрации
    const params: Record<string, string> = {};
    
    if (filter.category_id) params.category = filter.category_id.toString();
    if (filter.search) params.search = filter.search;
    if (filter.min_price) params.min_price = filter.min_price.toString();
    if (filter.max_price) params.max_price = filter.max_price.toString();
    if (filter.in_stock) params.in_stock = filter.in_stock.toString();
    
    setSearchParams(params);
    
    // Загружаем товары с новыми фильтрами
    getProducts(filter);
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilter({
      category_id: undefined,
      search: '',
      min_price: undefined,
      max_price: undefined,
      in_stock: false
    });
    setSearchParams({});
    getProducts({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Каталог продукции</h1>
      
      <div className="grid md:grid-cols-4 gap-8">
        {/* Фильтры */}
        <div className="md:col-span-1">
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold mb-4">Фильтры</h2>
              
              <div className="space-y-4">
                {/* Поиск */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
                  <Input
                    type="text"
                    placeholder="Название товара"
                    value={filter.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    fullWidth
                  />
                </div>
                
                {/* Категории */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={filter.category_id || ''}
                    onChange={(e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Все категории</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Цена */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="От"
                      value={filter.min_price || ''}
                      onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="До"
                      value={filter.max_price || ''}
                      onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                {/* Наличие на складе */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in_stock"
                    checked={filter.in_stock || false}
                    onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-700">
                    Только в наличии
                  </label>
                </div>
                
                {/* Кнопки */}
                <div className="flex flex-col space-y-2 pt-4">
                  <Button onClick={applyFilters} fullWidth>
                    Применить фильтры
                  </Button>
                  <Button onClick={resetFilters} variant="outline" fullWidth>
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Список товаров */}
        <div className="md:col-span-3">
          <ProductList />
        </div>
      </div>
    </div>
  );
};

export default Products;