import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
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
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    // Показываем лоадер, пока проверяем авторизацию
    if (loading) {
        return _jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/auth", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
// Маршрут только для гостей - редирект на главную для авторизованных
const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    // Показываем лоадер, пока проверяем авторизацию
    if (loading) {
        return _jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) });
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
const App = () => {
    const { checkAuth } = useAuth();
    // Проверяем авторизацию при запуске приложения
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    return (_jsxs(Routes, { children: [_jsxs(Route, { path: "/", element: _jsx(MainLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Home, {}) }), _jsx(Route, { path: "about", element: _jsx(About, {}) }), _jsx(Route, { path: "recipes", element: _jsx(Recipes, {}) }), _jsx(Route, { path: "products", element: _jsx(Products, {}) }), _jsx(Route, { path: "products/:productId", element: _jsx(ProductDetails, {}) }), _jsx(Route, { path: "categories/:categoryId", element: _jsx(CategoryProducts, {}) }), _jsx(Route, { path: "cart", element: _jsx(Cart, {}) }), _jsx(Route, { path: "checkout", element: _jsx(ProtectedRoute, { children: _jsx(Checkout, {}) }) }), _jsx(Route, { path: "orders", element: _jsx(ProtectedRoute, { children: _jsx(Orders, {}) }) }), _jsx(Route, { path: "orders/:orderId", element: _jsx(ProtectedRoute, { children: _jsx(OrderDetails, {}) }) }), _jsx(Route, { path: "orders/:orderId/success", element: _jsx(ProtectedRoute, { children: _jsx(OrderSuccess, {}) }) }), _jsx(Route, { path: "profile", element: _jsx(ProtectedRoute, { children: _jsx(Account, {}) }) })] }), _jsx(Route, { path: "/auth", element: _jsx(GuestRoute, { children: _jsx(AuthLayout, {}) }), children: _jsx(Route, { index: true, element: _jsx(Auth, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
};
export default App;
