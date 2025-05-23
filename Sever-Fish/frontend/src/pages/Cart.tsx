axios.defaults.withCredentials = true;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';
import CheckoutForm from '../components/CheckoutForm';
import { API_BASE_URL } from '../utils/apiConfig';

// Компонент уведомления о необходимости авторизации
const AuthNotification = () => {
  const navigate = useNavigate();
  
  // Сохраняем текущий путь в localStorage для перенаправления после авторизации
  useEffect(() => {
    localStorage.setItem('redirectAfterAuth', '/cart');
  }, []);

  return (
    <div className="cart-container">
      <div className="auth-notification">
        <h2>Для доступа к корзине необходимо войти в аккаунт</h2>
        <p>Чтобы добавлять товары в корзину и оформлять заказы, пожалуйста, авторизуйтесь</p>
        <button 
          onClick={() => navigate('/auth')} 
          className="login-button">
          Войти в аккаунт
        </button>
      </div>
    </div>
  );
};

// Интерфейсы для типизации данных
interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
}

// Интерфейс для пропсов компонента
interface CartProps {
  updateCartCount: () => void;
}

// Функция для получения корзины из localStorage
const getCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (e) {
    console.error('Ошибка при получении корзины из localStorage:', e);
  }
  return [];
};

// Функция для сохранения корзины в localStorage
const saveCartToLocalStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Ошибка при сохранении корзины в localStorage:', e);
  }
};

// Функция для создания временного заказа в локальном хранилище
const saveOrderToLocalStorage = (orderData, cartItems) => {
  try {
    const ordersJson = localStorage.getItem('localOrders');
    let orders = [];
    
    if (ordersJson) {
      orders = JSON.parse(ordersJson);
    }
    
    // Создаем временный заказ с идентификатором, основанным на текущем времени
    const tempOrder = {
      id: Date.now(),
      ...orderData,
      status: "pending",
      created_at: new Date().toISOString(),
      items: cartItems.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: item.quantity,
        price: item.product?.price || 0,
        product_name: item.product?.name || 'Неизвестный товар'
      }))
    };
    
    orders.push(tempOrder);
    localStorage.setItem('localOrders', JSON.stringify(orders));
    
    return true;
  } catch (e) {
    console.error('Ошибка при сохранении заказа в localStorage:', e);
    return false;
  }
};

// Основной компонент корзины
const Cart: React.FC<CartProps> = ({ updateCartCount }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Проверка авторизации
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  // Эффект для загрузки корзины при изменении состояния авторизации
  useEffect(() => {
    const loadCart = () => {
      try {
        const items = getCartFromLocalStorage();
        setCartItems(items);
        // Обновляем счетчик корзины
        updateCartCount();
      } catch (error) {
        console.error("Ошибка при загрузке корзины:", error);
        setCartItems([]);
      }
    };
    
    loadCart();
  }, [isAuthenticated, updateCartCount]);

  // Эффект для загрузки профиля пользователя, если он авторизован
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Пробуем получить профиль пользователя из localStorage
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('userEmail');
        const phone = localStorage.getItem('userPhone');
        const fullName = localStorage.getItem('userFullName');
        
        if (userId && username) {
          // Если есть основные данные, создаем профиль из localStorage
          setUserProfile({
            id: Number(userId),
            username: username,
            email: email,
            phone: phone,
            full_name: fullName
          });
          return;
        }
        
        // Если в localStorage нет всех данных, попробуем получить из токена
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Декодируем JWT токен
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            
            if (payload.user_id && payload.sub) {
              // Если в токене есть ID пользователя и email, создаем минимальный профиль
              setUserProfile({
                id: payload.user_id,
                username: payload.sub,
                email: payload.sub,
                phone: null,
                full_name: null
              });
              
              // Сохраняем данные в localStorage для будущего использования
              localStorage.setItem('userId', payload.user_id.toString());
              localStorage.setItem('username', payload.sub);
              localStorage.setItem('userEmail', payload.sub);
              
              return;
            }
          } catch (tokenError) {
            console.error('Ошибка при декодировании токена:', tokenError);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated]);

  // Обработчик нажатия кнопки удаления товара
  const handleRemoveItem = useCallback(async (itemId) => {
    try {
      // Удаляем товар из корзины
      const updatedCart = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedCart);
      
      // Сохраняем обновленную корзину в localStorage
      saveCartToLocalStorage(updatedCart);
      
      // Обновляем счетчик корзины в шапке
      updateCartCount();
    } catch (error) {
      console.error("Ошибка при удалении товара из корзины:", error);
      setError('Не удалось удалить товар из корзины');
    }
  }, [cartItems, updateCartCount]);

  // Обработчик изменения количества товара
  const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Обновляем количество товара в корзине
      const updatedCart = cartItems.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      setCartItems(updatedCart);
      
      // Сохраняем обновленную корзину в localStorage
      saveCartToLocalStorage(updatedCart);
      
      // Обновляем счетчик корзины в шапке
      updateCartCount();
    } catch (error) {
      console.error("Ошибка при изменении количества товара:", error);
      setError('Не удалось изменить количество товара');
    }
  }, [cartItems, updateCartCount]);

  // Обработчик нажатия кнопки очистки корзины
  const handleClearCart = useCallback(async () => {
    if (window.confirm("Вы уверены, что хотите очистить корзину?")) {
      try {
        // Очищаем корзину
        setCartItems([]);
        
        // Сохраняем пустую корзину в localStorage
        saveCartToLocalStorage([]);
        
        // Обновляем счетчик корзины в шапке
        updateCartCount();
      } catch (error) {
        console.error("Ошибка при очистке корзины:", error);
        setError('Не удалось очистить корзину');
      }
    }
  }, [updateCartCount]);

  // Обработчик нажатия кнопки оформления заказа
  const handleCheckout = () => {
    if (!isAuthenticated) {
      setError("Для оформления заказа необходимо авторизоваться");
      return;
    }
    
    if (cartItems.length === 0) {
      setError("Корзина пуста. Добавьте товары перед оформлением заказа.");
      return;
    }
    
    setShowCheckoutForm(true);
  };

  // Обработчик отмены оформления заказа
  const handleCancelCheckout = () => {
    setShowCheckoutForm(false);
  };
  
  // Функция для добавления товаров в корзину на сервере
  const addItemsToServerCart = async () => {
    if (!isAuthenticated || cartItems.length === 0) return false;
    
    try {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType') || 'Bearer';
      
      // Очищаем существующую корзину на сервере
      try {
        await axios.delete(`${API_BASE_URL}/cart`, {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
      } catch (clearError) {
        console.error("Ошибка при очистке корзины на сервере:", clearError);
      }
      
      // Добавляем товары в корзину на сервере
      for (const item of cartItems) {
        const response = await axios.post(`${API_BASE_URL}/cart`, {
          product_id: parseInt(item.product_id),
          quantity: item.quantity
        }, {
          headers: {
            'Authorization': `${tokenType} ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (debugMode) {
          console.log(`Товар ${item.product_id} добавлен в корзину на сервере:`, response.data);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при добавлении товаров в корзину на сервере:", error);
      return false;
    }
  };

  // Функция для оформления заказа
  const handleSubmitOrder = async (formData) => {
    if (!isAuthenticated) {
      setError("Для оформления заказа необходимо авторизоваться");
      return;
    }
    
    if (cartItems.length === 0) {
      setError("Корзина пуста. Добавьте товары перед оформлением заказа.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Формируем данные для заказа
      const orderData = {
        delivery_address: formData.address || "",
        phone: formData.phone || "",
        email: formData.email || "",
        name: `${formData.firstName} ${formData.lastName}`,
        comment: formData.comment || "",
        payment_method: formData.paymentMethod || "cash"
      };
      
      console.log("Данные для создания заказа:", orderData);
      
      // Создаем временную копию заказа в localStorage (на случай ошибок)
      saveOrderToLocalStorage(orderData, cartItems);
      
      // Сначала добавляем товары в корзину на сервере
      const cartSync = await addItemsToServerCart();
      
      if (!cartSync) {
        throw new Error("Не удалось синхронизировать корзину с сервером");
      }
      
      // Теперь отправляем запрос на создание заказа
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType') || 'Bearer';
      
      console.log("Отправляем заказ на сервер:", orderData);
      
      const response = await axios.post(`${API_BASE_URL}/orders/`, orderData, {
        headers: {
          'Authorization': `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Заказ успешно создан:", response.data);
      
      // Очищаем локальную корзину
      setCartItems([]);
      saveCartToLocalStorage([]);
      
      // Обновляем счетчик корзины в шапке
      updateCartCount();
      
      // Отмечаем успешное создание заказа
      setOrderSuccess(true);
      
      // Закрываем форму
      setShowCheckoutForm(false);
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      
      // Получаем детальную информацию об ошибке
      let errorMessage = 'Не удалось оформить заказ. Пожалуйста, попробуйте позже.';
      
      if (error.response && error.response.data) {
        console.log("Детальная информация об ошибке:", error.response.data);
        
        const responseData = error.response.data;
        
        // Если есть детальная информация об ошибке, показываем её
        if (responseData.detail) {
          if (Array.isArray(responseData.detail)) {
            // Если детали ошибки в виде массива
            const errorDetails = responseData.detail.map(item => 
              `${item.loc.join('.')}: ${item.msg}`
            ).join('; ');
            
            errorMessage = `Ошибка в данных заказа: ${errorDetails}`;
          } else if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для включения режима отладки
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };
  
  // Функция для форматирования цены
  const formatPrice = (price) => {
    // Если цена целое число, возвращаем без десятичной части
    if (Number.isInteger(price)) {
      return `${price} ₽`;
    }
    // Иначе округляем до 2 знаков после запятой
    return `${price.toFixed(2)} ₽`;
  };

  // Вычисляем общую стоимость корзины
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  if (loading) {
    return <div className="cart-container">Загрузка...</div>;
  }
  
  // Показываем сообщение об успешном оформлении заказа
  if (orderSuccess) {
    return (
      <div className="cart-container">
        <div className="success-message">
          <h2>Заказ успешно оформлен!</h2>
          <p>Спасибо за ваш заказ. В ближайшее время с вами свяжется наш менеджер для подтверждения заказа.</p>
          <p>Вы можете следить за статусом заказа в <a href="/account">личном кабинете</a>.</p>
          <button 
            onClick={() => {
              setOrderSuccess(false);
              navigate('/products');
            }}
            className="continue-shopping"
          >
            Продолжить покупки
          </button>
        </div>
      </div>
    );
  }

  // Показываем ошибку, но продолжаем отображать корзину, если есть товары
  const showError = error && (
    <div className="error-container">
      <div className="error">{error}</div>
    </div>
  );

  // Если пользователь не авторизован, показываем уведомление
  if (!isAuthenticated) {
    return <AuthNotification />;
  }

  // Если отображается форма оформления заказа
  if (showCheckoutForm) {
    // Предзаполняем форму данными пользователя, если они доступны
    const prefillData = userProfile ? {
      firstName: userProfile.full_name?.split(' ')[0] || '',
      lastName: userProfile.full_name?.split(' ')[1] || '',
      email: userProfile.email || '',
      phone: userProfile.phone || ''
    } : null;
    
    return (
      <CheckoutForm 
        onSubmit={handleSubmitOrder} 
        onCancel={handleCancelCheckout}
        totalPrice={totalPrice}
        cartItems={cartItems}
        prefillData={prefillData}
      />
    );
  }

  // Отладочная панель
  const debugPanel = debugMode && (
    <div style={{ padding: '10px', marginBottom: '20px', border: '1px solid #ddd', background: '#f9f9f9' }}>
      <h3>Отладочная информация</h3>
      <p>Товаров в корзине: {cartItems.length}</p>
      <p>Пользователь: {userProfile?.username || 'Не определен'} (ID: {userProfile?.id || 'Н/Д'})</p>
      <p>Токен: {localStorage.getItem('token') ? 'Имеется' : 'Отсутствует'}</p>
      <button 
        onClick={async () => {
          try {
            await addItemsToServerCart();
            alert('Корзина синхронизирована с сервером');
          } catch (e) {
            alert('Ошибка при синхронизации корзины: ' + e.message);
          }
        }} 
        style={{ marginRight: '10px' }}
      >
        Синхронизировать корзину
      </button>
      <button onClick={() => setDebugMode(false)}>Скрыть отладку</button>
    </div>
  );

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        {debugMode ? debugPanel : (
          <div style={{ textAlign: 'right', margin: '10px 0' }}>
            <button 
              onClick={toggleDebugMode}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: '#999', cursor: 'pointer' }}
            >
              ⚙️
            </button>
          </div>
        )}
        
        {showError}
        <div className="empty-cart">
          <h2>Ваша корзина пока пуста</h2>
          <p>Добавьте товары, чтобы оформить заказ</p>
          <button onClick={() => navigate('/products')} className="continue-shopping">
            Перейти в каталог
          </button>
        </div>
        
        <div className="cart-info" style={{ fontSize: '12px', color: '#777', marginTop: '20px', textAlign: 'center' }}>
          <p>Пользователь: {userProfile?.username || 'Гость'} | {new Date().toISOString().slice(0, 19).replace('T', ' ')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {debugMode ? debugPanel : (
        <div style={{ textAlign: 'right', margin: '10px 0' }}>
          <button 
            onClick={toggleDebugMode}
            style={{ background: 'none', border: 'none', fontSize: '12px', color: '#999', cursor: 'pointer' }}
          >
            ⚙️
          </button>
        </div>
      )}
      
      <h1>Ваша корзина</h1>
      
      {showError}
      
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            {item.product?.image_url && (
              <div className="item-image">
                <img src={item.product.image_url} alt={item.product.name} />
              </div>
            )}
            
            <div className="item-details">
              <div className="item-name">{item.product?.name}</div>
              <div className="item-price">
                {formatPrice(item.product?.price || 0)} за шт.
              </div>
              {item.product?.weight && (
                <div className="item-weight">
                  {item.product.weight}
                </div>
              )}
            </div>
            
            <div className="item-quantity">
              <button 
                className="quantity-button"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{item.quantity}</span>
              <button 
                className="quantity-button"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={item.quantity >= 99}
              >
                +
              </button>
            </div>
            
            <div className="item-total">
              {formatPrice((item.product?.price || 0) * item.quantity)}
            </div>
            
            <button 
              className="remove-button"
              onClick={() => handleRemoveItem(item.id)}
              aria-label="Удалить товар"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-controls">
        <button 
          className="clear-cart-button"
          onClick={handleClearCart}
          disabled={cartItems.length === 0}
        >
          Очистить корзину
        </button>
      </div>
      
      <div className="cart-summary">
        <div className="total-items">
          Товаров в корзине: <span>{cartItems.length}</span>
        </div>
        <div className="total-price">
          Итого: <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
      
      <div className="cart-buttons">
        <button 
          className="checkout-button"
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || loading}
        >
          {loading ? 'Обработка...' : 'Оформить заказ'}
        </button>
        
        <button 
          className="continue-shopping"
          onClick={() => navigate('/products')}
        >
          Продолжить покупки
        </button>
      </div>
      
      <div className="cart-info" style={{ fontSize: '12px', color: '#777', marginTop: '20px', textAlign: 'center' }}>
        <p>Пользователь: {userProfile?.username || 'Гость'} | {new Date().toISOString().slice(0, 19).replace('T', ' ')}</p>
      </div>
    </div>
  );
};

export default Cart;