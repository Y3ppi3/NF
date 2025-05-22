import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, createOrder } from '../services/api';
import { isAuthenticated } from '../services/auth';

const Cart = ({ updateCartCount }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState({
    delivery_address: '',
    phone: '',
    delivery_date: '',
    notes: ''
  });
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Проверка авторизации
    if (!isAuthenticated()) {
      // Сохраняем текущую страницу для редиректа после авторизации
      localStorage.setItem('redirectAfterAuth', '/cart');
      navigate('/auth');
      return;
    }

    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cartData = await getCart();
      setCartItems(cartData.items || []);
      
      if (updateCartCount) {
        updateCartCount(calculateTotalItems(cartData.items || []));
      }
    } catch (err) {
      console.error('Ошибка при загрузке корзины:', err);
      setError('Не удалось загрузить корзину. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, { quantity: newQuantity });
      
      // Обновляем состояние корзины локально
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      if (updateCartCount) {
        updateCartCount(calculateTotalItems(cartItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )));
      }
    } catch (err) {
      console.error('Ошибка при обновлении количества:', err);
      setError('Не удалось обновить количество товара. Пожалуйста, попробуйте позже.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      
      // Удаляем товар из локального состояния
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      
      if (updateCartCount) {
        updateCartCount(calculateTotalItems(updatedItems));
      }
    } catch (err) {
      console.error('Ошибка при удалении товара:', err);
      setError('Не удалось удалить товар из корзины. Пожалуйста, попробуйте позже.');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Проверка формы
      if (!checkoutData.delivery_address || !checkoutData.phone) {
        throw new Error('Пожалуйста, заполните обязательные поля');
      }
      
      // Создание заказа
      const orderData = {
        delivery_address: checkoutData.delivery_address,
        phone: checkoutData.phone,
        delivery_date: checkoutData.delivery_date || undefined,
        notes: checkoutData.notes || undefined
      };
      
      const response = await createOrder(orderData);
      
      // Сбрасываем корзину в интерфейсе
      setCartItems([]);
      if (updateCartCount) {
        updateCartCount(0);
      }
      
      // Показываем сообщение об успешном размещении заказа
      setOrderPlaced(true);
      setOrderNumber(response.id || response.order_number);
    } catch (err) {
      console.error('Ошибка при создании заказа:', err);
      setError(err.message || 'Не удалось создать заказ. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
  };

  // Если заказ успешно создан
  if (orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Заказ успешно оформлен!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Ваш заказ №{orderNumber} принят и находится в обработке. 
            Мы свяжемся с вами в ближайшее время для подтверждения деталей.
          </p>
          <div className="mt-8">
            <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Вернуться к товарам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 my-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {isCheckout ? 'Оформление заказа' : 'Корзина'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-red-500">×</span>
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          <h2 className="text-2xl font-medium text-gray-700 mb-4">Ваша корзина пуста</h2>
          <p className="text-gray-500 mb-8">Добавьте товары для оформления заказа</p>
          <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Перейти к товарам
          </Link>
        </div>
      ) : isCheckout ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleCheckoutSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Информация для доставки</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес доставки *
                  </label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={checkoutData.delivery_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={checkoutData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Желаемая дата доставки
                  </label>
                  <input
                    type="date"
                    name="delivery_date"
                    value={checkoutData.delivery_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий к заказу
                  </label>
                  <textarea
                    name="notes"
                    value={checkoutData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                
                <div className="md:col-span-2">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Ваш заказ</h2>
                  <div className="border-t border-b py-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-2">
                        <div>
                          <span className="font-medium">{item.product.name}</span>
                          <span className="text-gray-600 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">{(item.product.price * item.quantity).toLocaleString()} ₽</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 text-lg font-bold">
                    <span>Итого:</span>
                    <span>{calculateTotal().toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0">
                <button
                  type="button"
                  onClick={() => setIsCheckout(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Вернуться к корзине
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg text-white ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {loading ? 'Оформление...' : 'Оформить заказ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Товар
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Количество
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Всего
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-14 flex-shrink-0">
                        <img 
                          className="h-14 w-14 object-cover rounded" 
                          src={item.product.image_url || "/placeholder.jpg"} 
                          alt={item.product.name}
                          onError={(e) => { e.target.src = "/placeholder.jpg"; e.target.onerror = null; }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/products/${item.product.id}`} className="hover:text-blue-600">
                            {item.product.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.product.price?.toLocaleString()} ₽</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center border rounded-md w-24">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        −
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-10 px-1 py-1 text-center focus:outline-none" 
                      />
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 hover:text-gray-800"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {(item.product.price * item.quantity).toLocaleString()} ₽
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <span className="text-gray-600">Всего товаров: </span>
                <span className="font-medium">{calculateTotalItems(cartItems)}</span>
              </div>
              <div className="text-xl font-bold">
                <span className="text-gray-800">Итого: </span>
                <span>{calculateTotal().toLocaleString()} ₽</span>
              </div>
              <button
                onClick={() => setIsCheckout(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;