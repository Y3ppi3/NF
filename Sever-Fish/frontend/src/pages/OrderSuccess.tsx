import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../utils/formatters';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById, currentOrder, loading } = useOrders();

  useEffect(() => {
    if (orderId) {
      getOrderById(Number(orderId));
    }
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <div className="mb-6 text-green-600">
          <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Заказ успешно оформлен!</h1>
        
        {currentOrder ? (
          <div className="mb-8">
            <p className="text-lg mb-2">Номер вашего заказа: <strong>#{currentOrder.id}</strong></p>
            <p className="text-lg">Сумма заказа: <strong>{formatPrice(currentOrder.total_amount)}</strong></p>
          </div>
        ) : (
          <p className="text-lg mb-8">Ваш заказ был успешно создан и принят в обработку.</p>
        )}
        
        <p className="text-gray-600 mb-8">
          Мы отправили подтверждение на вашу электронную почту. Вы можете отслеживать статус заказа в личном кабинете.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link to="/orders">
            <Button>Мои заказы</Button>
          </Link>
          
          <Link to="/products">
            <Button variant="outline">Продолжить покупки</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;