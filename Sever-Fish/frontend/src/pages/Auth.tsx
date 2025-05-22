import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error: authError, loading } = useAuth();
  const navigate = useNavigate();
  
  // Состояние для форм
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Обработчик изменения формы входа
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения формы регистрации
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Валидация формы входа
  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginForm.username) {
      newErrors.username = 'Введите имя пользователя';
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Введите пароль';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Валидация формы регистрации
  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!registerForm.username) {
      newErrors.username = 'Введите имя пользователя';
    } else if (!isValidUsername(registerForm.username)) {
      newErrors.username = 'Имя пользователя должно содержать от 3 до 20 символов (буквы, цифры, _)';
    }
    
    if (!registerForm.email) {
      newErrors.email = 'Введите email';
    } else if (!isValidEmail(registerForm.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Введите пароль';
    } else if (!isValidPassword(registerForm.password)) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (registerForm.password !== registerForm.confirm_password) {
      newErrors.confirm_password = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы входа
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    const success = await login(loginForm);
    
    if (success) {
      navigate('/');
    }
  };

  // Обработчик отправки формы регистрации
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }
    
    const success = await register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      full_name: registerForm.full_name
    });
    
    if (success) {
      navigate('/');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">
          {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
        </h1>
      </CardHeader>
      
      <CardBody>
        {authError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {authError}
          </div>
        )}
        
        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя или Email
                </label>
                <Input
                  type="text"
                  name="username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  error={errors.username}
                  fullWidth
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <Input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  error={errors.password}
                  fullWidth
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" fullWidth isLoading={loading}>
                  Войти
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя
                </label>
                <Input
                  type="text"
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  error={errors.username}
                  fullWidth
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  error={errors.email}
                  fullWidth
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ФИО (опционально)
                </label>
                <Input
                  type="text"
                  name="full_name"
                  value={registerForm.full_name}
                  onChange={handleRegisterChange}
                  fullWidth
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <Input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  error={errors.password}
                  fullWidth
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Подтверждение пароля
                </label>
                <Input
                  type="password"
                  name="confirm_password"
                  value={registerForm.confirm_password}
                  onChange={handleRegisterChange}
                  error={errors.confirm_password}
                  fullWidth
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" fullWidth isLoading={loading}>
                  Зарегистрироваться
                </Button>
              </div>
            </div>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </CardBody>
    </Card>
  );
};

export default Auth;