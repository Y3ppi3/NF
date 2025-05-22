import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrderList } from '../components/order/OrderList';
import { Button } from '../components/ui/Button';

const Orders: React.FC = () => {
  const { orders, getOrders, loading, error } = useOrders();

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Мои заказы</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Ошибка загрузки заказов: {error}
          <div className="mt-4">
            <Button onClick={getOrders}>Попробовать снова</Button>
          </div>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h2 className="text-xl font-semibold mb-4">У вас пока нет заказов</h2>
              <p className="text-gray-500 mb-8">Воспользуйтесь каталогом, чтобы сделать первый заказ</p>
              <Link to="/products">
                <Button>Перейти в каталог</Button>
              </Link>
            </div>
          ) : (
            <OrderList orders={orders} />
          )}
        </>
      )}
    </div>
  );
};

export default Orders;