import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, addToCart } from '../services/api';
import { isAuthenticated } from '../services/auth';

const ProductDetail = ({ updateCartCount }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Пробуем несколько маршрутов API
        const endpoints = [
          `${API_BASE_URL}/products/${id}`,
          `${API_BASE_URL}/api/products/${id}`
        ];
        
        let productData = null;
        let fetchError = null;
        
        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(endpoint);
            productData = response.data;
            break;
          } catch (err) {
            fetchError = err;
            // Продолжаем пробовать следующий URL
          }
        }
        
        if (productData) {
          setProduct(productData);
        } else {
          throw fetchError || new Error('Не удалось получить данные о товаре');
        }
      } catch (err) {
        console.error('Ошибка при получении данных о товаре:', err);
        setError('Не удалось загрузить информацию о товаре. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) || value < 1 ? 1 : value);
  };
  
  const handleAddToCart = async () => {
    // Проверяем авторизацию
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      setAddingToCart(true);
      
      await addToCart({
        product_id: product.id,
        quantity: quantity
      });
      
      // Обновляем счетчик корзины
      if (updateCartCount) {
        // Получаем текущее значение из localStorage или 0
        const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
        const newCount = currentCount + quantity;
        localStorage.setItem('cartCount', newCount.toString());
        updateCartCount(newCount);
      }
      
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      console.error('Ошибка при добавлении в корзину:', err);
      setError('Не удалось добавить товар в корзину. Пожалуйста, попробуйте позже.');
    } finally {
      setAddingToCart(false);
    }
  };
  
  const handleGoToAuth = () => {
    // Сохраняем текущую страницу для редиректа после авторизации
    localStorage.setItem('redirectAfterAuth', `/products/${id}`);
    navigate('/auth');
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 my-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 my-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="text-center py-8">
          <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Вернуться к каталогу
          </Link>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 my-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium text-gray-700 mb-4">Товар не найден</h2>
          <p className="text-gray-500 mb-8">Запрашиваемый товар не существует или был удален</p>
          <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Вернуться к каталогу
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 my-8">
      <div className="mb-6">
        <Link to="/products" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Вернуться к каталогу
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-4">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image_url || "/placeholder.jpg"}
                alt={product.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => { e.target.src = "/placeholder.jpg"; e.target.onerror = null; }}
              />
            </div>
          </div>
          
          <div className="md:w-1/2 p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <span className="text-blue-800 font-bold text-2xl">{product.price?.toLocaleString()} ₽</span>
              {product.old_price && (
                <span className="ml-2 text-gray-500 text-lg line-through">{product.old_price?.toLocaleString()} ₽</span>
              )}
            </div>
            
            {product.category && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Категория: </span>
                <span className="text-sm font-medium text-gray-700">{product.category.name}</span>
              </div>
            )}
            
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-line">{product.description || "Описание отсутствует"}</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <span className="text-gray-700 mr-3">Количество:</span>
                <div className="flex border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border-r text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-12 text-center focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border-l text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`px-6 py-3 rounded-lg text-white flex items-center transition-colors ${
                  addSuccess
                    ? 'bg-green-600'
                    : addingToCart
                    ? 'bg-blue-400'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Добавление...
                  </>
                ) : addSuccess ? (
                  <>
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Добавлено
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    В корзину
                  </>
                )}
              </button>
              
              <Link
                to="/cart"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Перейти в корзину
              </Link>
            </div>
            
            {product.stock_quantity && (
              <div className="mt-4 text-sm text-gray-500">
                {product.stock_quantity > 10 ? (
                  <span className="text-green-600">В наличии</span>
                ) : product.stock_quantity > 0 ? (
                  <span className="text-orange-600">Осталось мало: {product.stock_quantity} шт.</span>
                ) : (
                  <span className="text-red-600">Нет в наличии</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Модальное окно для авторизации */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Требуется авторизация</h2>
            <p className="text-gray-600 mb-6">
              Для добавления товаров в корзину необходимо войти в аккаунт или зарегистрироваться.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Отмена
              </button>
              <button 
                onClick={handleGoToAuth}
                className="px-4 py-2 bg-blue-700 rounded text-white hover:bg-blue-800"
              >
                Войти / Зарегистрироваться
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;