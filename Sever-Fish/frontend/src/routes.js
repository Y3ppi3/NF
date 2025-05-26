import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/storage';
// Импорт макетов
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
// Импорт страниц (предполагается, что они уже существуют)
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { CategoryProducts } from './pages/CategoryProducts';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { NotFound } from './pages/NotFound';
// Защищенный маршрут - только для авторизованных пользователей
const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return _jsx(Navigate, { to: "/auth", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
// Маршрут только для гостей - редирект на главную для авторизованных
const GuestRoute = ({ children }) => {
    if (isAuthenticated()) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
// Маршруты приложения
export const routes = [
    {
        path: '/',
        element: _jsx(MainLayout, {}),
        children: [
            { index: true, element: _jsx(Home, {}) },
            { path: 'products/:productId', element: _jsx(ProductDetails, {}) },
            { path: 'categories/:categoryId', element: _jsx(CategoryProducts, {}) },
            { path: 'cart', element: _jsx(Cart, {}) },
            {
                path: 'checkout',
                element: (_jsx(ProtectedRoute, { children: _jsx(Checkout, {}) })),
            },
            {
                path: 'orders',
                element: (_jsx(ProtectedRoute, { children: _jsx(Orders, {}) })),
            },
            {
                path: 'orders/:orderId',
                element: (_jsx(ProtectedRoute, { children: _jsx(OrderDetails, {}) })),
            },
            {
                path: 'orders/:orderId/success',
                element: (_jsx(ProtectedRoute, { children: _jsx(OrderSuccess, {}) })),
            },
            {
                path: 'profile',
                element: (_jsx(ProtectedRoute, { children: _jsx(Profile, {}) })),
            },
        ],
    },
    {
        path: '/auth',
        element: (_jsx(GuestRoute, { children: _jsx(AuthLayout, {}) })),
        children: [{ index: true, element: _jsx(Auth, {}) }],
    },
    {
        path: '*',
        element: _jsx(NotFound, {}),
    },
];
