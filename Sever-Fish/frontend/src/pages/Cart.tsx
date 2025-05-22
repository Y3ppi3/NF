import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { CartItemComponent } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { Button } from '../components/ui/Button';

// Компонент уведомления о необходимости авторизации
const AuthNotification: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="cart-container">
      <div className="auth-notification p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Для доступа к корзине необходимо войти в аккаунт</h2>
        <p className="mb-6 text-gray-600">Чтобы добавлять товары в корзину и оформлять заказы, пожалуйста, авторизуйтесь</p>
        <Button 
          onClick={() => navigate('/auth')} 
          size="lg"
        >
          Войти в аккаунт
        </Button>
      </div>
    </div>
  );
};

// Компонент пустой корзины
const EmptyCart: React.FC = () => {
  return (
    <div className="py-8 text-center">
      <div className="mb-6">
        <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Ваша корзина пуста</h2>
      <p className="text-gray-500 mb-8">Добавьте товары в корзину, чтобы оформить заказ</p>
      <Link to="/products">
        <Button variant="primary">Перейти к каталогу</Button>
      </Link>
    </div>
  );
};

// Основной компонент корзины
const Cart: React.FC = () => {
  const { items, totalItems, getCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Загружаем корзину при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      getCart();
    }
  }, [isAuthenticated, getCart]);

  // Если пользователь не авторизован, показываем уведомление
  if (!isAuthenticated) {
    return <AuthNotification />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center text-blue-800">Корзина</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : totalItems === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="cart-items space-y-6">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;