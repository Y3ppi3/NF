import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, currentProduct, loading, error } = useProducts();
  const { addToCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      getProductById(Number(productId));
    }
  }, [productId, getProductById]);

  const handleQuantityChange = (value: number) => {
    if (quantity + value > 0) {
      setQuantity(quantity + value);
    }
  };

  const handleAddToCart = async () => {
    if (currentProduct) {
      const success = await addToCart({
        product_id: currentProduct.id,
        quantity
      });
      
      if (success) {
        navigate('/cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Ошибка загрузки товара: {error}
        </div>
        <Button onClick={() => getProductById(Number(productId))}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
        <Link to="/products" className="text-blue-600 hover:text-blue-800">
          Вернуться к каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-blue-600">Каталог</Link>
        <span className="mx-2">/</span>
        <span>{currentProduct.name}</span>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Изображение товара */}
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={currentProduct.image_url || '/images/products/default-product.jpg'}
              alt={currentProduct.name}
              className="w-full h-auto object-contain rounded"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/products/default-product.jpg';
              }}
            />
          </div>
        </div>
        
        {/* Информация о товаре */}
        <div>
          <h1 className="text-3xl font-bold mb-4 text-blue-900">
            {currentProduct.name}
          </h1>
          
          <div className="text-2xl font-bold text-blue-600 mb-6">
            {formatPrice(currentProduct.price)}
          </div>
          
          <div className="mb-6">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              currentProduct.is_available && currentProduct.stock > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {currentProduct.is_available && currentProduct.stock > 0
                ? 'В наличии'
                : 'Нет в наличии'}
            </div>
          </div>
          
          {currentProduct.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Описание</h3>
              <p className="text-gray-700">
                {currentProduct.description}
              </p>
            </div>
          )}
          
          {/* Выбор количества и добавление в корзину */}
          {currentProduct.is_available && currentProduct.stock > 0 && (
            <Card className="mb-6">
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Количество:</span>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 h-8 text-center border-t border-b border-gray-300"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  fullWidth
                  size="lg"
                  isLoading={cartLoading}
                >
                  Добавить в корзину
                </Button>
              </CardBody>
            </Card>
          )}
          
          {/* Дополнительная информация */}
          <div className="space-y-4 text-sm">
            <div className="flex">
              <span className="w-32 text-gray-600">Код товара:</span>
              <span className="font-medium">{currentProduct.id}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-600">Категория:</span>
              <span className="font-medium">
                <Link 
                  to={`/categories/${currentProduct.category_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {/* Здесь можно добавить имя категории, если есть доступ */}
                  Категория {currentProduct.category_id}
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;