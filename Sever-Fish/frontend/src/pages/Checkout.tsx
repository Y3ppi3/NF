import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { formatPrice } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

interface CheckoutForm {
  shipping_address: string;
  contact_phone: string;
  notes: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, getCart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { createOrder, loading: orderLoading } = useOrders();
  
  // Состояние формы оформления заказа
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    shipping_address: '',
    contact_phone: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Проверяем авторизацию и загружаем корзину
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      getCart();
    }
  }, [isAuthenticated, navigate, getCart]);

  // Заполняем адрес и телефон из профиля пользователя
  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        shipping_address: user.address || '',
        contact_phone: user.phone || ''
      }));
    }
  }, [user]);

  // Если корзина пуста, перенаправляем на страницу корзины
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate('/cart');
    }
  }, [items, cartLoading, navigate]);

  // Обработчик изменения формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckoutForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!checkoutForm.shipping_address.trim()) {
      newErrors.shipping_address = 'Введите адрес доставки';
    }
    
    if (!checkoutForm.contact_phone.trim()) {
      newErrors.contact_phone = 'Введите контактный телефон';
    } else if (!/^\+?[0-9]{10,12}$/.test(checkoutForm.contact_phone.trim())) {
      newErrors.contact_phone = 'Введите корректный номер телефона';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await createOrder({
      shipping_address: checkoutForm.shipping_address,
      contact_phone: checkoutForm.contact_phone,
    });
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Оформление заказа</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Форма оформления заказа */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Данные для доставки</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес доставки*
                    </label>
                    <Input
                      type="text"
                      name="shipping_address"
                      value={checkoutForm.shipping_address}
                      onChange={handleChange}
                      error={errors.shipping_address}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Контактный телефон*
                    </label>
                    <Input
                      type="tel"
                      name="contact_phone"
                      value={checkoutForm.contact_phone}
                      onChange={handleChange}
                      error={errors.contact_phone}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Примечание к заказу
                    </label>
                    <textarea
                      name="notes"
                      value={checkoutForm.notes}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                      rows={4}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      isLoading={orderLoading}
                    >
                      Оформить заказ
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
        
        {/* Сводка заказа */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Ваш заказ</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <div className="font-medium">{item.product?.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} шт. × {formatPrice(item.product?.price || 0)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Всего товаров:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-lg">Итого:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;