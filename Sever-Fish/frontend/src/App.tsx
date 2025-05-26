import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Импорт макетов
import { MainLayout } from './layout/MainLayout';

// Импорт страниц
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import Account from './pages/Account';
import Recipes from './pages/Recipes';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

// Защищенный маршрут - только для авторизованных пользователей
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Показываем лоадер, пока проверяем авторизацию
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Маршрут только для гостей - редирект на главную для авторизованных
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Показываем лоадер, пока проверяем авторизацию
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { checkAuth } = useAuth();
  
  // Проверяем авторизацию при запуске приложения
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Основные маршруты с MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="recipes" element={<Recipes />} />
        
        {/* Товары */}
        <Route path="products" element={<Products />} />
        <Route path="products/:productId" element={<ProductDetails />} />
        <Route path="categories/:categoryId" element={<CategoryProducts />} />
        
        {/* Корзина и заказы */}
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        
        {/* Заказы - требуют авторизации */}
        <Route path="orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="orders/:orderId" element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        } />
        <Route path="orders/:orderId/success" element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        } />
        
        {/* Профиль пользователя */}
        <Route path="profile" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Авторизация и регистрация */}
      <Route path="/auth" element={
        <GuestRoute>
          <AuthLayout />
        </GuestRoute>
      }>
        <Route index element={<Auth />} />
      </Route>
      
      {/* Страница 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;