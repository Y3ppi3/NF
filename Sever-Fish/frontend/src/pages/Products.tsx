import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Products = ({ updateCartCount }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const productsPerPage = 12;

  // Базовый URL API
  const API_BASE_URL = "http://127.0.0.1:8000";
  
  // Исправленные пути API согласно FastAPI маршрутам
  const PRODUCTS_API = `${API_BASE_URL}/products`;
  const CART_API = `${API_BASE_URL}/cart`;

  // Константа для URL заглушки, если изображения не найдены
  const PLACEHOLDER_IMAGE = "/images/fish-placeholder.jpg";

  // Фиксированные категории из базы данных
  const DB_CATEGORIES = [
    { id: "1", name: "Консервы", description: "Рыбные консервы разных видов" },
    { id: "2", name: "Икра", description: "Икра различных видов рыб" },
    { id: "3", name: "Деликатесы", description: "Рыбные деликатесы премиум-класса" },
    { id: "4", name: "Свежая рыба", description: "Свежая охлажденная рыба" },
    { id: "5", name: "Замороженная рыба", description: "Свежемороженая рыба различных видов" },
    { id: "6", name: "Морепродукты", description: "Различные виды морепродуктов" },
    { id: "7", name: "Полуфабрикаты", description: "Рыбные полуфабрикаты готовые к приготовлению" },
    { id: "8", name: "Копчёная рыба", description: "Рыба холодного и горячего копчения" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Загружаем продукты из API
        await fetchProducts();
        
        // Используем фиксированные категории
        console.log("Использование фиксированных категорий из БД:", DB_CATEGORIES);
        setCategories(DB_CATEGORIES);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchProducts = async () => {
    // Список возможных API маршрутов для продуктов
    const productApis = [
      PRODUCTS_API,
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
        
        // Обработка полученных данных
        const processedProducts = processProducts(res.data);
        setProducts(processedProducts);
        setError(null);
        return processedProducts;
      } catch (error) {
        console.error(`Ошибка при запросе к ${api}:`, error);
        // Продолжаем пробовать другие API
      }
    }
    
    // Если все попытки не удались
    setError("Не удалось загрузить товары с сервера. Пожалуйста, попробуйте позже.");
    return [];
  };

  // Функция для обработки данных о продуктах
  const processProducts = (products) => {
    return products.map(product => {
      // Преобразуем category_id в строку, если это необходимо
      if (product.category_id !== undefined && product.category_id !== null) {
        product.category_id = product.category_id.toString();
      }
      
      // Полный путь к изображению, если оно не начинается с / или http
      if (product.image_url && !product.image_url.startsWith('http') && !product.image_url.startsWith('/')) {
        product.image_url = '/' + product.image_url;
      }
      
      return product;
    });
  };

  // Функция для получения продуктов по категории
  const fetchProductsByCategory = async (categoryId) => {
    setIsLoading(true);
    
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
        
        // Обработка полученных данных
        const processedProducts = processProducts(res.data);
        setProducts(processedProducts);
        setError(null);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error(`Ошибка при запросе к ${api}:`, error);
        // Продолжаем пробовать другие API
      }
    }
    
    // Если не удалось получить товары по API, фильтруем имеющиеся
    const filteredProducts = products.filter(p => 
      p.category_id === categoryId
    );
    
    if (filteredProducts.length > 0) {
      setProducts(filteredProducts);
    } else {
      await fetchProducts(); // Загружаем все продукты
      // Фильтруем по категории на стороне клиента
      const newFilteredProducts = products.filter(p => 
        p.category_id === categoryId
      );
      if (newFilteredProducts.length > 0) {
        setProducts(newFilteredProducts);
      } else {
        setError(`Не удалось найти товары в категории ${categoryId}`);
      }
    }
    
    setIsLoading(false);
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category.id);
    setCurrentPage(1);
    setIsLoading(true);
    
    try {
      // Фильтруем имеющиеся продукты по категории
      const filteredProducts = products.filter(p => 
        p.category_id === category.id
      );
      
      if (filteredProducts.length > 0) {
        setProducts(filteredProducts);
        setIsLoading(false);
      } else {
        // Если нет продуктов в этой категории, пробуем загрузить с сервера
        await fetchProductsByCategory(category.id);
      }
    } catch (error) {
      console.error("Ошибка при выборе категории:", error);
      setError("Не удалось загрузить товары выбранной категории");
      setIsLoading(false);
    }
  };

  // Функция для добавления товара в корзину
  const addToCart = async (productId, event) => {
    event.preventDefault(); // Предотвращаем переход по ссылке
    
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType');
    
    // Проверяем, авторизован ли пользователь
    if (!token || !tokenType) {
      // Показываем модальное окно для авторизации
      setShowAuthModal(true);
      return;
    }
    
    const button = event.currentTarget;
    // Анимация для кнопки
    button.innerText = "Добавляем...";
    button.classList.add("bg-yellow-600");
    
    try {
      // Получаем текущую корзину из localStorage
      const cartDataString = localStorage.getItem('cart');
      let cartData = [];
      
      if (cartDataString) {
        try {
          cartData = JSON.parse(cartDataString);
        } catch (e) {
          console.error('Ошибка при парсинге корзины из localStorage:', e);
          cartData = [];
        }
      }
      
      // Находим продукт, который добавляем в корзину
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        throw new Error('Товар не найден');
      }
      
      // Проверяем, есть ли уже этот товар в корзине
      const existingItemIndex = cartData.findIndex(item => item.product_id === productId);
      
      if (existingItemIndex >= 0) {
        // Если товар уже есть в корзине, увеличиваем количество
        cartData[existingItemIndex].quantity += 1;
      } else {
        // Если товара нет в корзине, добавляем его
        cartData.push({
          id: Date.now(), // Используем timestamp как id
          product_id: productId,
          quantity: 1,
          product: product
        });
      }
      
      // Сохраняем обновленную корзину в localStorage
      localStorage.setItem('cart', JSON.stringify(cartData));
      
      // Также пробуем отправить на сервер
      try {
        // Список возможных API маршрутов для корзины
        const cartApis = [
          CART_API,
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
                'Authorization': `${tokenType} ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            console.log("Товар успешно добавлен в корзину на сервере");
            break;
          } catch (apiError) {
            console.error(`Ошибка при добавлении в корзину по ${api}:`, apiError);
            // Продолжаем пробовать другие API
          }
        }
      } catch (serverError) {
        console.error("Не удалось добавить товар в корзину на сервере:", serverError);
        // Продолжаем работу с локальной корзиной
      }
      
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
    } catch (error) {
      console.error("Ошибка при добавлении товара в корзину:", error);
      
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

  // Расчет текущих отображаемых продуктов
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const lastProductIndex = currentPage * productsPerPage;
  const firstProductIndex = lastProductIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(firstProductIndex, lastProductIndex);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Функция для генерации диапазона пагинации
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

  // Функция для форматирования цены
  const formatPrice = (price) => {
    if (!price) return "0 ₽";
    return `${price.toLocaleString()} ₽`;
  };

  // Функция для возврата к отображению всех продуктов
  const handleShowAllProducts = () => {
    setSelectedCategory("");
    setCurrentPage(1);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Каталог продукции</h1>
      
      {/* Отображение ошибок */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-red-500">×</span>
          </button>
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
                        selectedCategory === cat.id
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
                    onClick={fetchProducts}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : (
                <>
                  {/* Заголовок категории */}
                  {selectedCategory && (
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {categories.find(c => c.id === selectedCategory)?.name || "Категория"}
                      </h2>
                      <p className="text-gray-600">
                        {categories.find(c => c.id === selectedCategory)?.description || ""}
                      </p>
                    </div>
                  )}
                  
                  {/* Сетка продуктов */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <Link to={`/products/${product.id}`} className="block relative">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={product.image_url || PLACEHOLDER_IMAGE}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.target.src = PLACEHOLDER_IMAGE;
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-800 text-lg mb-1 line-clamp-2">{product.name}</h3>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description || "Без описания"}</p>
                            
                            {product.weight && (
                              <div className="text-gray-600 text-sm mb-2">
                                Вес: {product.weight}
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-blue-800">{formatPrice(product.price)}</span>
                              <button
                                onClick={(e) => addToCart(product.id, e)}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                disabled={product.stock_quantity <= 0}
                              >
                                {product.stock_quantity <= 0 ? "Нет в наличии" : "В корзину"}
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