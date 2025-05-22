import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, isAuthenticated } from '../services/auth';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  
  // Проверяем, не выполнен ли уже вход в систему
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirectPath);
    }
  }, [navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (!loginUsername || !loginPassword) {
        throw new Error('Пожалуйста, заполните все поля');
      }
      
      await login({
        username: loginUsername,
        password: loginPassword
      });
      
      setSuccess('Вход успешно выполнен');
      
      // Редиректим на страницу, с которой пришли, или на главную
      setTimeout(() => {
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
        localStorage.removeItem('redirectAfterAuth');
        navigate(redirectPath);
      }, 500);
    } catch (err) {
      console.error('Ошибка при входе:', err);
      setError(err.response?.data?.detail || 'Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) {
        throw new Error('Пожалуйста, заполните все обязательные поля');
      }
      
      if (registerPassword !== registerConfirmPassword) {
        throw new Error('Пароли не совпадают');
      }
      
      if (registerPassword.length < 8) {
        throw new Error('Пароль должен содержать не менее 8 символов');
      }
      
      await register({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        full_name: registerFullName,
        phone: registerPhone
      });
      
      setSuccess('Регистрация успешно завершена');
      
      // Редиректим на страницу, с которой пришли, или на главную
      setTimeout(() => {
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
        localStorage.removeItem('redirectAfterAuth');
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      setError(err.response?.data?.detail || err.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 my-12 bg-white rounded-lg shadow-md">
      <div className="flex border-b mb-6">
        <button 
          className={`py-2 px-4 ${activeTab === 'login' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('login')}
        >
          Вход
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'register' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('register')}
        >
          Регистрация
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Успех!</strong>
          <span className="block sm:inline"> {success}</span>
        </div>
      )}
      
      {activeTab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
            <input
              id="username"
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              id="password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Выполняется вход...
                </span>
              ) : 'Войти'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя *</label>
            <input
              id="register-username"
              type="text"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              id="register-email"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="register-full-name" className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
            <input
              id="register-full-name"
              type="text"
              value={registerFullName}
              onChange={(e) => setRegisterFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input
              id="register-phone"
              type="tel"
              value={registerPhone}
              onChange={(e) => setRegisterPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Пароль *</label>
            <input
              id="register-password"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Минимум 8 символов</p>
          </div>
          
          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Подтверждение пароля *</label>
            <input
              id="register-confirm-password"
              type="password"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Регистрация...
                </span>
              ) : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Auth;