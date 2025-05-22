import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import { useLoading } from '../context/LoadingContext';

// Пример данных для аварийного режима (когда бэкенд недоступен)
const FALLBACK_CATEGORIES = [
  { id: 1, name: "Свежая рыба", slug: "fresh-fish" },
  { id: 2, name: "Замороженная рыба", slug: "frozen-fish" },
  { id: 3, name: "Икра", slug: "caviar" },
  { id: 4, name: "Морепродукты", slug: "seafood" }
];

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Лосось атлантический",
    description: "Свежий атлантический лосось премиум качества",
    price: 1200,
    category_id: 1,
    image_url: "/images/salmon.jpg"
  },
  {
    id: 2,
    name: "Форель радужная",
    description: "Охлажденная радужная форель",
    price: 950,
    category_id: 1,
    image_url: "/images/trout.jpg"
  },
  {
    id: 3,
    name: "Креветки королевские",
    description: "Крупные королевские креветки",
    price: 1500,
    category_id: 4,
    image_url: "/images/shrimp.jpg"
  },
  {
    id: 4,
    name: "Икра лососевая",
    description: "Красная икра высшего сорта",
    price: 3200,
    category_id: 3,
    image_url: "/images/caviar.jpg"
  }
];

const Products = ({ updateCartCount }) => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ status: 'unknown' });
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const productsPerPage = 12;

  useEffect(() => {
    if (category) {
      // Если есть параметр category в URL, устанавливаем его как выбранную категорию
      const foundCategory = categories.find(cat => cat.slug === category);
      if (foundCategory) {
        setSelectedCategory(foundCategory.id.toString());
      }
    }
  }, [category, categories]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      startLoading();
      
      try {
        // Проверяем статус сервера
        await checkApiHealth();
        
        // Получаем данные параллельно
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        
        if (productsData && productsData.length > 0) setProducts(productsData);
        if (categoriesData && categoriesData.length > 0) setCategories(categoriesData);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные. Используется автономный режим.");
        
        // Если произошла ошибка, используем резервные данные
        setProducts(FALLBACK_PRODUCTS);
        setCategories(FALLBACK_CATEGORIES);
        setIsOfflineMode(true);
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };
    
    fetchData();
  }, []);

  const checkApiHealth = async () => {
    try {
      const endpoints = [
        `${API_BASE_URL}/health`,
        `${API_BASE_URL}/api/health`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, { timeout: 5000 });
          if (response.data && response.data.status) {
            setApiStatus(response.data);
            return true;
          }
        } catch (error) {
          // Продолжаем проверку других эндпоинтов
        }
      }
      
      // Если ни один эндпоинт не ответил
      setApiStatus({ status: 'error', message: 'API сервер недоступен' });
      return false;
    } catch (error) {
      console.error('Ошибка при проверке статуса API:', error);
      setApiStatus({ status: 'error', message: 'Не удалось проверить статус API' });
      return false;
    }
  };

  const fetchProducts = async () => {
    try {
      // Список возможных API маршрутов для продуктов
      const productApis = [
        `${API_BASE_URL}/products`,
        `${API_BASE_URL}/api/products`
      ];
      
      for (const api of productApis) {
        try {
          console.log(`Попытка запроса продуктов по адресу: ${api}`);
          const res = await axios.get(api, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          console.log("Получены продукты:", res.data);
          return res.data;
        } catch (error) {
          console.error(`Ошибка при запросе к ${api}:`, error);
          // Продолжаем пробовать другие API
        }
      }
      
      // Если все попытки не удались, возвращаем пустой массив
      throw new Error("Не удалось загрузить товары. Проверьте работу сервера.");
    } catch (error) {
      console.error("Ошибка при получении товаров:", error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      // Список возможных API маршрутов для категорий
      const categoryApis = [
        `${API_BASE_URL}/products/categories`,
        `${API_BASE_URL}/api/categories`,
        `${API_BASE_URL}/categories`
      ];
      
      for (const api of categoryApis) {
        try {
          console.log(`Попытка запроса категорий по адресу: ${api}`);
          const res = await axios.get(api, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          console.log("Получены категории:", res.data);
          
          // Обработка данных для совместимости
          const processedCategories = res.data.map(cat => {
            // Убедимся, что каждая категория имеет slug
            if (!cat.slug && cat.name) {
              cat.slug = cat.name.toLowerCase().replace(/\s+/g, '-');
            }
            return cat;
          });
          
          return processedCategories;
        } catch (error) {
          console.error(`Ошибка при запросе к ${api}:`, error);
          // Продолжаем пробовать другие API
        }
      }
      
      // Если все попытки не удались, возвращаем пустой массив
      throw new Error("Не удалось загрузить категории. Проверьте работу сервера.");
    } catch (error) {
      console.error("Ошибка при получении категорий:", error);
      throw error;
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    setIsLoading(true);
    startLoading();
    
    try {
      if (isOfflineMode) {
        // В автономном режиме фильтруем локальные данные
        setProducts(FALLBACK_PRODUCTS.filter(p => p.category_id.toString() === categoryId));
        setIsLoading(false);
        stopLoading();
        return;
      }
      
      // Список возможных API маршрутов для продуктов по категории
      const categoryProductApis = [
        `${API_BASE_URL}/products/category/${categoryId}`,
        `${API_BASE_URL}/api/products/category/${categoryId}`
      ];
      
      for (const api of categoryProductApis) {
        try {
          console.log(`Попытка запроса продуктов по категории: ${api}`);
          const res = await axios.get(api, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          console.log("Получены продукты по категории:", res.data);
          setProducts(res.data);
          setIsLoading(false);
          stopLoading();
          return;
        } catch (error) {
          console.error(`Ошибка при запросе к ${api}:`, error);
          // Продолжаем пробовать другие API
        }
      }
      
      // Если не удалось получить товары по категории, пробуем загрузить все товары
      if (!isOfflineMode) {
        try {
          setError("Не удалось загрузить товары по выбранной категории. Загружаем все товары.");
          const allProducts = await fetchProducts();
          setProducts(allProducts.filter(p => p.category_id.toString() === categoryId));
        } catch (e) {
          console.error("Также не удалось загрузить все товары:", e);
          // В случае неудачи используем резервные данные
          setProducts(FALLBACK_PRODUCTS.filter(p => p.category_id.toString() === categoryId));
          setIsOfflineMode(true);
        }
      }
    } catch (err) {
      console.error(`Ошибка при получении товаров по категории ${categoryId}:`, err);
      setError("Не удалось загрузить товары по выбранной категории.");
      
      // В случае ошибки используем резервные данные
      setProducts(FALLBACK_PRODUCTS.filter(p => p.category_id.toString() === categoryId));
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category.id.toString());
    setCurrentPage(1);
    
    // Обновляем URL с новым параметром категории
    navigate(`/products/category/${category.slug}`);
    
    if (isOfflineMode) {
      // В автономном режиме просто фильтруем локальные данные
      setProducts(FALLBACK_PRODUCTS.filter(p => p.category_id === category.id));
    } else {
      await fetchProductsByCategory(category.id);
    }
  };

  const handleAddToCart = async (productId, event) => {
    event.preventDefault(); // Предотвращаем переход по ссылке
    
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    
    // Проверяем, авторизован ли пользователь
    if (!token) {
      // Показываем модальное окно для авторизации
      setShowAuthModal(true);
      return;
    }
    
    const button = event.currentTarget;
    // Анимация для кнопки
    button.innerText = "Добавляем...";
    button.classList.add("bg-yellow-600");
    
    try {
      if (isOfflineMode) {
        // В автономном режиме только анимируем добавление
        setTimeout(() => {
          button.innerText = "Добавлено ✓";
          button.classList.remove("bg-yellow-600");
          button.classList.add("bg-green-600");
          
          // Возвращаем исходный текст после короткой задержки
          setTimeout(() => {
            button.innerText = "В корзину";
            button.classList.remove("bg-green-600");
          }, 1500);
        }, 1000);
        
        // Имитируем обновление счетчика корзины
        if (updateCartCount) {
          updateCartCount();
        }
        
        return;
      }
      
      // Список возможных API маршрутов для корзины
      const cartApis = [
        `${API_BASE_URL}/cart`,
        `${API_BASE_URL}/api/cart`
      ];
      
      for (const api of cartApis) {
        try {
          console.log(`Добавление товара ${productId} в корзину по адресу: ${api}`);
          await axios.post(api, {
            product_id: productId,
            quantity: 1,
          }, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          // Обновляем счетчик корзины
          if (updateCartCount) {
            updateCartCount();
          }
          
          // Изменяем текст кнопки на успешный
          button.innerText = "Добавлено ✓";
          button.classList.remove("bg-yellow-600");
          button.classList.add("bg-green-600");
          
          // Возвращаем исходный текст после короткой задержки
          setTimeout(() => {
            button.innerText = "В корзину";
            button.classList.remove("bg-green-600");
          }, 1500);
          
          return;
        } catch (error) {
          console.error(`Ошибка при добавлении в корзину по ${api}:`, error);
          // Продолжаем пробовать другие API
        }
      }
      
      // Сбрасываем кнопку и показываем ошибку
      button.innerText = "В корзину";
      button.classList.remove("bg-yellow-600");
      
      // Показываем ошибку пользователю
      setError("Не удалось добавить товар в корзину. Проверьте соединение с сервером.");
    } catch (error) {
      console.error("Ошибка при добавлении в корзину:", error);
      
      // Сбрасываем кнопку и показываем ошибку
      button.innerText = "В корзину";
      button.classList.remove("bg-yellow-600");
      
      // Показываем ошибку пользователю
      setError("Не удалось добавить товар в корзину. Проверьте соединение с сервером.");
    }
  };

  // Обработчик для перехода на страницу авторизации
  const handleGoToAuth = () => {
    // Сохраняем текущее состояние, чтобы вернуться после авторизации
    localStorage.setItem('redirectAfterAuth', '/products');
    navigate('/auth');
  };

  // Функция для сброса выбранной категории и загрузки всех товаров
  const handleShowAllProducts = () => {
    setSelectedCategory("");
    setCurrentPage(1);
    navigate('/products');
    
    if (isOfflineMode) {
      // В автономном режиме просто возвращаем все резервные данные
      setProducts(FALLBACK_PRODUCTS);
    } else {
      fetchProducts()
        .then(data => setProducts(data))
        .catch(err => {
          console.error(err);
          setProducts(FALLBACK_PRODUCTS);
          setIsOfflineMode(true);
        });
    }
  };

  // Фильтрация товаров по выбранной категории
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id?.toString() === selectedCategory)
    : products;

  // Пагинация
  const lastProductIndex = currentPage * productsPerPage;
  const firstProductIndex = lastProductIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(firstProductIndex, lastProductIndex);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getPaginationRange = () => {
    const delta = 2;
    let range = [];
    
    range.push(1);
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    let result = [];
    let lastVal = 0;
    
    for (const val of range) {
      if (lastVal && val - lastVal > 1) {
        result.push("...");
      }
      result.push(val);
      lastVal = val;
    }
    
    return result;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Каталог продукции</h1>
      
      {/* Отображение ошибок */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Внимание!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-red-500">×</span>
          </button>
        </div>
      )}
      
      {isOfflineMode && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Автономный режим!</strong>
          <span className="block sm:inline"> Работа в автономном режиме с ограниченной функциональностью.</span>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Боковая панель с категориями */}
        <aside className="lg:w-1/4">
          <div className="bg-white shadow-sm rounded-lg p-5 lg:sticky lg:top-5">
            <h2 className="text-xl font-medium text-gray-800 mb-4 pb-2 border-b">Категории</h2>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={handleShowAllProducts}
                  className={`w-full text-left py-2 px-3 rounded transition-colors ${
                    selectedCategory === "" 
                    ? "bg-blue-50 text-blue-800 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Все товары
                </button>
              </li>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full text-left py-2 px-3 rounded transition-colors ${
                        selectedCategory === cat.id?.toString() 
                        ? "bg-blue-50 text-blue-800 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic p-2">Категории не загружены</li>
              )}
            </ul>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="lg:w-3/4">
          {/* Loader */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">
                    {error ? "Ошибка загрузки товаров" : "Товары не найдены"}
                  </p>
                  <button 
                    onClick={handleShowAllProducts}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Показать все товары
                  </button>
                </div>
              ) : (
                <>
                  {/* Сетка продуктов */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <Link to={`/products/${product.id}`} className="block relative">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={product.image_url || "/placeholder.jpg"}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/placeholder.jpg";
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-800 text-lg mb-1 line-clamp-2">{product.name}</h3>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description || "Без описания"}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-blue-800">{product.price?.toLocaleString()} ₽</span>
                              <button
                                onClick={(e) => handleAddToCart(product.id, e)}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                              >
                                В корзину
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          &larr;
                        </button>
                        
                        {getPaginationRange().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => page !== "..." && setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              page === currentPage
                                ? "z-10 bg-blue-50 border-blue-700 text-blue-800"
                                : page === "..."
                                ? "text-gray-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          &rarr;
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
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

export default Products;