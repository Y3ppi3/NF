import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrderSummary } from '../components/order/OrderSummary';
import { Button } from '../components/ui/Button';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, currentOrder, loading, error, cancelOrder } = useOrders();

  useEffect(() => {
    if (orderId) {
      getOrderById(Number(orderId));
    }
  }, [orderId, getOrderById]);

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    
    if (window.confirm('Вы уверены, что хотите отменить этот заказ?')) {
      const success = await cancelOrder(currentOrder.id);
      
      if (success) {
        // Перезагружаем данные заказа
        getOrderById(currentOrder.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Ошибка загрузки заказа: {error}
        </div>
        <Button onClick={() => navigate('/orders')}>
          Вернуться к списку заказов
        </Button>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Заказ не найден</h2>
        <Link to="/orders" className="text-blue-600 hover:text-blue-800">
          Вернуться к списку заказов
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <span className="mx-2">/</span>
        <Link to="/orders" className="hover:text-blue-600">Мои заказы</Link>
        <span className="mx-2">/</span>
        <span>Заказ #{currentOrder.id}</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
        Информация о заказе #{currentOrder.id}
      </h1>
      
      <OrderSummary order={currentOrder} />
      
      {/* Кнопки действий */}
      <div className="flex justify-center mt-8 space-x-4">
        <Button
          onClick={() => navigate('/orders')}
          variant="outline"
        >
          Назад к списку заказов
        </Button>
        
        {currentOrder.status === 'pending' && (
          <Button
            onClick={handleCancelOrder}
            variant="danger"
          >
            Отменить заказ
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;