import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductCategory from './pages/ProductCategory';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Recipes from './pages/Recipes';
import Production from './pages/Production';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import axios from 'axios';
import Account from './pages/Account';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import MobileMenu from './components/MobileMenu';
import ProductDetail from './pages/ProductDetail';
// Добавляем импорт API_BASE_URL
import { API_BASE_URL } from './utils/apiConfig';

// Компонент для защиты приватных маршрутов
function RequireAuth({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem('token');
    const location = useLocation();
    
    // Проверяем срок действия токена
    const isTokenValid = () => {
        if (!token) return false;
        
        try {
            // Декодируем JWT токен
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            
            // Проверяем срок действия токена (exp указан в секундах)
            if (payload.exp) {
                const expirationTime = payload.exp * 1000; // переводим в миллисекунды
                return Date.now() < expirationTime;
            }
            
            // Если в токене нет информации о сроке действия, считаем его валидным
            return true;
        } catch (error) {
            console.error('Ошибка при проверке токена:', error);
            return false;
        }
    };
    
    if (!token || !isTokenValid()) {
        // Запоминаем текущий путь для перенаправления после авторизации
        localStorage.setItem('redirectAfterAuth', location.pathname);
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    
    return children;
}

function App() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Функция для проверки авторизации
    const checkAuthentication = () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            return false;
        }
        
        try {
            // Декодируем JWT токен
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            
            // Проверяем срок действия токена (exp указан в секундах)
            if (payload.exp) {
                const expirationTime = payload.exp * 1000; // переводим в миллисекунды
                const isValid = Date.now() < expirationTime;
                
                if (!isValid) {
                    // Если токен просрочен, очищаем localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('tokenType');
                    setIsAuthenticated(false);
                    return false;
                }
            }
            
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Ошибка при проверке токена:', error);
            setIsAuthenticated(false);
            return false;
        }
    };

    // Функция для обновления счетчика корзины
    const updateCartCount = () => {
        try {
            // Проверяем авторизацию
            if (!checkAuthentication()) {
                setCartCount(0);
                return;
            }
            
            // Получаем данные корзины из localStorage
            const cartDataString = localStorage.getItem('cart');
            if (cartDataString) {
                try {
                    const cartData = JSON.parse(cartDataString);
                    if (Array.isArray(cartData)) {
                        // Считаем общее количество товаров
                        const count = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
                        setCartCount(count);
                        return;
                    }
                } catch (e) {
                    console.error('Ошибка при парсинге корзины из localStorage:', e);
                }
            }
            
            // Если корзина не найдена или пуста
            setCartCount(0);
        } catch (error) {
            console.error("Ошибка при обновлении счетчика корзины:", error);
            setCartCount(0);
        }
    };
  
    // Функция для переключения меню
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prevState => !prevState);
    };

    // Функция для закрытия меню
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Настройка интерцептора axios
    useEffect(() => {
        // Добавляем токен авторизации ко всем запросам
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                const tokenType = localStorage.getItem('tokenType') || 'Bearer';
                
                if (token) {
                    config.headers.Authorization = `${tokenType} ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
        
        // Обрабатываем ошибки авторизации
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    // Если сервер ответил 401, пользователь не авторизован
                    console.log('Ошибка авторизации, перенаправление на страницу входа');
                    // НЕ очищаем токен здесь, чтобы не вызывать цикл обновлений
                }
                return Promise.reject(error);
            }
        );
        
        // Удаляем интерцепторы при размонтировании
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    // Инициализация состояния аутентификации и корзины
    useEffect(() => {
        checkAuthentication();
        updateCartCount();
        
        // Настраиваем обработчик для события storage,
        // чтобы обновлять состояние при изменении localStorage в другой вкладке
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' || e.key === null) {
                checkAuthentication();
                updateCartCount();
            } else if (e.key === 'cart') {
                updateCartCount();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Управление классом body для мобильного меню
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isMobileMenuOpen]);

    // Проверяем, нужно ли перенаправить пользователя после авторизации
    useEffect(() => {
        if (isAuthenticated) {
            const redirectPath = localStorage.getItem('redirectAfterAuth');
            
            if (redirectPath) {
                // Очищаем информацию о перенаправлении
                localStorage.removeItem('redirectAfterAuth');
                // Обновляем количество товаров в корзине
                updateCartCount();
            }
        }
    }, [isAuthenticated]);

    // Показываем загрузку, пока не определили состояние аутентификации
    if (isAuthenticated === null) {
        return <div className="app-loading">Загрузка...</div>;
    }

    return (
        <Router>
            <Header 
                onMenuToggle={toggleMobileMenu} 
                cartCount={cartCount} 
                updateCartCount={updateCartCount} 
                isAuthenticated={isAuthenticated}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products updateCartCount={updateCartCount} />} />
                <Route path="/products/category/:category" element={<Products updateCartCount={updateCartCount} />} />
                <Route path="/products/:id" element={<ProductDetail updateCartCount={updateCartCount} />} />
                
                {/* Защищенные маршруты */}
                <Route path="/cart" element={
                    <RequireAuth>
                        <Cart updateCartCount={updateCartCount} />
                    </RequireAuth>
                } />
                <Route path="/account" element={
                    <RequireAuth>
                        <Account />
                    </RequireAuth>
                } />
                
                {/* Общедоступные маршруты */}
                <Route path="/about" element={<About />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/production" element={<Production />} />
                
                {/* Страница авторизации с проверкой, если уже авторизован */}
                <Route path="/auth" element={
                    isAuthenticated ? 
                        <Navigate to="/account" replace /> : 
                        <Auth />
                } />
                
                {/* Перенаправление для несуществующих маршрутов */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
            <CookieConsent />
            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                setIsOpen={setIsMobileMenuOpen} 
                isAuthenticated={isAuthenticated}
            />
        </Router>
    );
}

export default App;