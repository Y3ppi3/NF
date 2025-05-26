import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { OrderList } from '../components/order/OrderList';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

interface ProfileForm {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { orders, getOrders, loading: ordersLoading } = useOrders();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Состояние для форм
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем авторизацию и загружаем данные
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/auth');
    } else if (isAuthenticated) {
      // Загружаем заказы пользователя
      getOrders();
    }
  }, [isAuthenticated, authLoading, navigate, getOrders]);

  // Обновляем форму при получении данных пользователя
  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Обработчик изменения формы профиля
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения формы пароля
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик обновления профиля
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProfileUpdateSuccess(false);
    
    try {
      // Здесь должен быть вызов API для обновления профиля
      // Например: await updateProfile(profileForm);
      
      // Имитация успешного обновления
      setTimeout(() => {
        setProfileUpdateSuccess(true);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении профиля');
    }
  };

  // Обработчик изменения пароля
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordUpdateSuccess(false);
    
    // Проверка совпадения паролей
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Новый пароль и подтверждение не совпадают');
      return;
    }
    
    try {
      // Здесь должен быть вызов API для изменения пароля
      // Например: await changePassword(passwordForm);
      
      // Имитация успешного обновления
      setTimeout(() => {
        setPasswordUpdateSuccess(true);
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Ошибка при изменении пароля');
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Личный кабинет</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('orders')}
        >
          Мои заказы
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('password')}
        >
          Изменить пароль
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mb-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Данные профиля</h2>
            </CardHeader>
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              {profileUpdateSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  Профиль успешно обновлен
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                    <Input
                      type="text"
                      name="full_name"
                      value={profileForm.full_name}
                      onChange={handleProfileChange}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
                    <Input
                      type="text"
                      name="address"
                      value={profileForm.address}
                      onChange={handleProfileChange}
                      fullWidth
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" fullWidth>
                      Сохранить изменения
                    </Button>
                  </div>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button variant="danger" onClick={logout} fullWidth>
                  Выйти из аккаунта
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">История заказов</h2>
            </CardHeader>
            <CardBody>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <OrderList orders={orders} />
              )}
            </CardBody>
          </Card>
        )}
        
        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Изменение пароля</h2>
            </CardHeader>
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              {passwordUpdateSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  Пароль успешно изменен
                </div>
              )}
              
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
                    <Input
                      type="password"
                      name="current_password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                    <Input
                      type="password"
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Подтверждение пароля</label>
                    <Input
                      type="password"
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      fullWidth
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" fullWidth>
                      Изменить пароль
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Account;