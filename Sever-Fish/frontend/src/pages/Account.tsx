import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Account.css';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/apiConfig';

const Account = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const navigate = useNavigate();

  // Проверяем авторизацию при загрузке компонента
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchOrders()
        ]);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType') || 'Bearer';
      
      const response = await axios.get(API_ENDPOINTS.USER_PROFILE, {
        headers: {
          'Authorization': `${tokenType} ${token}`
        }
      });
      
      if (response.data) {
        setUserProfile(response.data);
        
        // Сохраняем данные в localStorage
        localStorage.setItem('userId', response.data.id?.toString() || '');
        localStorage.setItem('username', response.data.username || '');
        localStorage.setItem('userEmail', response.data.email || '');
        localStorage.setItem('userPhone', response.data.phone || '');
        localStorage.setItem('userFullName', response.data.full_name || '');
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      
      // Если не удалось загрузить с сервера, используем localStorage
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('userEmail');
      const phone = localStorage.getItem('userPhone');
      const fullName = localStorage.getItem('userFullName');
      
      if (userId && username) {
        setUserProfile({
          id: Number(userId),
          username,
          email,
          phone,
          full_name: fullName
        });
      } else {
        setError('Не удалось загрузить информацию о пользователе');
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType') || 'Bearer';
      
      let ordersData = [];
      
      // Пробуем первый эндпоинт
      try {
        const response = await axios.get(API_ENDPOINTS.ORDERS, {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Заказы получены с основного эндпоинта:', response.data);
          ordersData = response.data;
        }
      } catch (primaryError) {
        console.error('Ошибка при загрузке заказов с основного эндпоинта:', primaryError);
        
        // Пробуем альтернативный эндпоинт
        try {
          const altResponse = await axios.get(API_ENDPOINTS.ORDERS_ALT, {
            headers: {
              'Authorization': `${tokenType} ${token}`
            }
          });
          
          if (altResponse.data && Array.isArray(altResponse.data)) {
            console.log('Заказы получены с альтернативного эндпоинта:', altResponse.data);
            ordersData = altResponse.data;
          }
        } catch (secondaryError) {
          console.error('Ошибка при загрузке заказов с альтернативного эндпоинта:', secondaryError);
          throw new Error('Не удалось загрузить историю заказов с сервера');
        }
      }
      
      // Сортируем заказы по дате (новые сначала)
      ordersData.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      setError('Не удалось загрузить историю заказов');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Валидация
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Пароль должен содержать минимум 8 символов');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType') || 'Bearer';
      
      await axios.post(`${API_BASE_URL}/auth/change-password`, {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      }, {
        headers: {
          'Authorization': `${tokenType} ${token}`
        }
      });
      
      setPasswordSuccess('Пароль успешно изменен');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Ошибка при смене пароля:', error);
      
      if (error.response && error.response.status === 401) {
        setPasswordError('Неверный текущий пароль');
      } else {
        setPasswordError('Ошибка при смене пароля. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusName = (status) => {
    const statuses = {
      'new': 'Новый',
      'pending': 'В обработке',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'canceled': 'Отменен'
    };
    
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="account-container">
      <h1 className="account-title">Личный кабинет</h1>
      
      <div className="account-tabs">
        <button 
          className={`account-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
        <button 
          className={`account-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Мои заказы
        </button>
        <button 
          className={`account-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Изменить пароль
        </button>
        <button 
          className="account-tab logout-tab"
          onClick={handleLogout}
        >
          Выйти
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">&times;</button>
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div className="account-section">
          <h2>Информация о пользователе</h2>
          
          {userProfile ? (
            <div className="profile-info">
              <div className="profile-field">
                <span className="field-label">Имя пользователя:</span>
                <span className="field-value">{userProfile.username}</span>
              </div>
              
              {userProfile.email && (
                <div className="profile-field">
                  <span className="field-label">Email:</span>
                  <span className="field-value">{userProfile.email}</span>
                </div>
              )}
              
              {userProfile.phone && (
                <div className="profile-field">
                  <span className="field-label">Телефон:</span>
                  <span className="field-value">{userProfile.phone}</span>
                </div>
              )}
              
              {userProfile.full_name && (
                <div className="profile-field">
                  <span className="field-label">Полное имя:</span>
                  <span className="field-value">{userProfile.full_name}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">Данные профиля не загружены</p>
          )}
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div className="account-section">
          <h2>История заказов</h2>
          
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <div className="order-id">Заказ #{order.id}</div>
                    <div className={`order-status status-${order.status}`}>
                      {getStatusName(order.status)}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-info">
                      <div className="info-item">
                        <span className="info-label">Дата заказа:</span>
                        <span className="info-value">{formatDate(order.created_at)}</span>
                      </div>
                      
                      {order.delivery_address && (
                        <div className="info-item">
                          <span className="info-label">Адрес доставки:</span>
                          <span className="info-value">{order.delivery_address}</span>
                        </div>
                      )}
                      
                      {order.contact_name && (
                        <div className="info-item">
                          <span className="info-label">Получатель:</span>
                          <span className="info-value">{order.contact_name}</span>
                        </div>
                      )}
                      
                      {order.payment_method && (
                        <div className="info-item">
                          <span className="info-label">Способ оплаты:</span>
                          <span className="info-value">
                            {order.payment_method === 'card' ? 'Картой при получении' :
                              order.payment_method === 'cash' ? 'Наличными при получении' :
                                'Онлайн оплата'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="order-items">
                        <h3>Товары в заказе:</h3>
                        <ul className="items-list">
                          {order.items.map((item, index) => (
                            <li key={index} className="item-row">
                              <span className="item-name">
                                {item.product?.name || `Товар #${item.product_id}`}
                              </span>
                              <span className="item-quantity">{item.quantity} шт.</span>
                              <span className="item-price">{item.price * item.quantity} ₽</span>
                            </li>
                          ))}
                        </ul>
                        <div className="order-total">
                          Итого: <span>{order.total_amount} ₽</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-orders">
              <p>У вас пока нет заказов</p>
              <Link to="/products" className="shop-button">
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'password' && (
        <div className="account-section">
          <h2>Изменение пароля</h2>
          
          {passwordError && (
            <div className="error-message">
              {passwordError}
              <button onClick={() => setPasswordError('')} className="close-error">&times;</button>
            </div>
          )}
          
          {passwordSuccess && (
            <div className="success-message">
              {passwordSuccess}
              <button onClick={() => setPasswordSuccess('')} className="close-success">&times;</button>
            </div>
          )}
          
          <form onSubmit={handleSubmitPasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Текущий пароль</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">Новый пароль</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                minLength={8}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                minLength={8}
                required
              />
            </div>
            
            <button type="submit" className="submit-button">
              Изменить пароль
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Account;