import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductList } from '../components/product/ProductList';

const CategoryProducts: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getProductsByCategory, categories, loading, error } = useProducts();

  useEffect(() => {
    if (categoryId) {
      getProductsByCategory(Number(categoryId));
    }
  }, [categoryId, getProductsByCategory]);

  // Находим текущую категорию
  const currentCategory = categories.find(cat => cat.id === Number(categoryId));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-blue-600">Каталог</Link>
        <span className="mx-2">/</span>
        <span>{currentCategory?.name || 'Категория'}</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
        {currentCategory?.name || 'Товары категории'}
      </h1>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Ошибка загрузки товаров категории: {error}
        </div>
      ) : (
        <ProductList categoryId={Number(categoryId)} />
      )}
    </div>
  );
};

export default CategoryProducts;