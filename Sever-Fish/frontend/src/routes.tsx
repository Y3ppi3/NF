import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
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
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

// Маршрут только для гостей - редирект на главную для авторизованных
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Маршруты приложения
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products/:productId', element: <ProductDetails /> },
      { path: 'categories/:categoryId', element: <CategoryProducts /> },
      { path: 'cart', element: <Cart /> },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:orderId',
        element: (
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:orderId/success',
        element: (
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [{ index: true, element: <Auth /> }],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];