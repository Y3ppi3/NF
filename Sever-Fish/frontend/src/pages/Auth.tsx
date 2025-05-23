import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Интерфейсы для форм
interface RegisterFormData {
  phone: string;
  email: string;
  name: string;
  password: string;
  password_confirm: string;
}

interface LoginFormData {
  email: string; // Изменено с username на email
  password: string;
}

const Auth: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Форма регистрации
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    phone: '',
    email: '',
    name: '',
    password: '',
    password_confirm: ''
  });

  // Форма входа
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '', // Изменено с username на email
    password: ''
  });

  // Обработчик изменения полей регистрации
  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: value
    });
  };

  // Обработчик изменения полей входа
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value
    });
  };

  // Форматирование телефонного номера
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифры
    const phoneNumber = value.replace(/\D/g, '');
    
    // Форматируем номер в виде +7 (XXX) XXX-XX-XX
    if (phoneNumber.length <= 1) {
      return phoneNumber;
    } else if (phoneNumber.length <= 4) {
      return `+7 (${phoneNumber.slice(1)}`;
    } else if (phoneNumber.length <= 7) {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    } else if (phoneNumber.length <= 9) {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    } else {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
    }
  };

  // Обработка изменения телефона с форматированием
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isLogin: boolean) => {
    const { value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    
    if (isLogin) {
      // Больше не используется для формы входа, так как мы используем email
    } else {
      setRegisterForm({
        ...registerForm,
        phone: formattedValue
      });
    }
  };

  // Генерация случайного строкового идентификатора
  const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Обработчик регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Проверка совпадения паролей
    if (registerForm.password !== registerForm.password_confirm) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    // Очищаем номер телефона от форматирования
    const phoneNumber = registerForm.phone.replace(/\D/g, '');
    
    // Проверка на пустой телефон
    if (!phoneNumber.trim() || phoneNumber.length < 11) {
      setError('Введите корректный номер телефона');
      setLoading(false);
      return;
    }
    
    // Проверка на корректность email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerForm.email.trim() || !emailRegex.test(registerForm.email)) {
      setError('Введите корректный email');
      setLoading(false);
      return;
    }
    
    // Удалена проверка на пустое имя

    try {
      const url = 'http://127.0.0.1:8000/auth/register';
      
      console.log("URL для регистрации:", url);
      
      // Добавляем случайный суффикс к имени для уникальности в базе данных
      // Это решение временное, пока не изменена схема БД
      const uniqueUsername = registerForm.name 
        ? `${registerForm.name}_${generateRandomString(6)}` 
        : `user_${phoneNumber}_${generateRandomString(6)}`;
      
      // Создаем запрос на регистрацию
      const requestBody = {
        name: uniqueUsername, // Используем уникальное имя
        password: registerForm.password,
        email: registerForm.email,
        phone: phoneNumber
      };
      
      console.log("Отправляемые данные:", requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      // Отладочное сообщение для проверки статуса ответа
      console.log("Статус ответа:", response.status);

      // Сначала попробуем получить текст ответа
      const responseText = await response.text();
      console.log("Текст ответа:", responseText);

      // Преобразуем текст в JSON, если возможно
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Ответ сервера (JSON):", data);
      } catch (e) {
        console.error("Ошибка при парсинге JSON:", e);
        data = { detail: "Ошибка парсинга ответа сервера" };
      }

      if (!response.ok) {
        // Более подробная обработка ошибок
        if (data.detail && Array.isArray(data.detail)) {
          // Если сервер возвращает массив ошибок (как в примере с missing field)
          const errorMessages = data.detail.map((err: any) => {
            if (err.type === "missing" && err.loc) {
              return `Отсутствует обязательное поле: ${err.loc[err.loc.length - 1]}`;
            }
            return err.msg || "Неизвестная ошибка";
          });
          throw new Error(errorMessages.join(", "));
        } else if (data.detail) {
          throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
        } else {
          throw new Error('Ошибка при регистрации');
        }
      }

      // После успешной регистрации переходим на форму входа
      setIsLoginMode(true);
      
      // Заполняем поля формы входа данными из регистрации для удобства
      setLoginForm({
        email: registerForm.email, // Используем email для входа
        password: registerForm.password
      });
      
      alert('Регистрация успешна! Теперь вы можете войти в систему используя свой email.');
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработчик входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = 'http://127.0.0.1:8000/auth/login';
      
      console.log("URL для входа:", url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: loginForm.email, // Изменено с username на email
          password: loginForm.password
        }),
      });

      // Отладочное сообщение для проверки статуса ответа
      console.log("Статус ответа:", response.status);

      // Сначала попробуем получить текст ответа
      const responseText = await response.text();
      console.log("Текст ответа:", responseText);

      // Преобразуем текст в JSON, если возможно
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Ответ сервера (JSON):", data);
      } catch (e) {
        console.error("Ошибка при парсинге JSON:", e);
        data = { detail: "Ошибка парсинга ответа сервера" };
      }

      if (!response.ok) {
        // Более детальная обработка ошибок
        if (data.detail && Array.isArray(data.detail)) {
          const errorMessages = data.detail.map((err: any) => {
            return err.msg || "Неизвестная ошибка";
          });
          throw new Error(errorMessages.join(", "));
        } else if (data.detail) {
          throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
        } else {
          throw new Error('Ошибка при входе');
        }
      }

      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('tokenType', data.token_type);
      
      // Даже если в данных нет информации о пользователе, мы все равно авторизуем его
      // и перенаправляем на страницу аккаунта
      
      // Нужна небольшая задержка перед перенаправлением, чтобы токен успел сохраниться
      setTimeout(() => {
        // Всегда перенаправляем на страницу аккаунта после успешного входа
        navigate('/account', { replace: true });
      }, 100);
      
    } catch (error) {
      console.error("Ошибка входа:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при входе');
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}</h1>
          <div className="auth-mode-switch">
            <button
              className={isLoginMode ? 'active' : ''}
              onClick={() => setIsLoginMode(true)}
              type="button"
            >
              Вход
            </button>
            <button
              className={!isLoginMode ? 'active' : ''}
              onClick={() => setIsLoginMode(false)}
              type="button"
            >
              Регистрация
            </button>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {isLoginMode ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginInputChange}
                placeholder="example@mail.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginInputChange}
                placeholder="Введите пароль"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'Выполняется вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input
                type="text"
                id="name"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterInputChange}
                placeholder="Введите ваше имя"
                autoComplete="name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Номер телефона</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={registerForm.phone}
                onChange={(e) => handlePhoneChange(e, false)}
                placeholder="+7 (___) ___-__-__"
                required
                autoComplete="tel"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterInputChange}
                placeholder="example@mail.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterInputChange}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm">Подтверждение пароля</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={registerForm.password_confirm}
                onChange={handleRegisterInputChange}
                placeholder="Повторите пароль"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Стили для страницы авторизации и регистрации */
        .auth-container {
          max-width: 380px; /* Уменьшил ширину для компактности */
          margin: 20px auto; /* Уменьшил отступы */
          padding: 0 10px;
        }

        .auth-card {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px; /* Уменьшил внутренние отступы */
        }

        .auth-header {
          text-align: center;
          margin-bottom: 15px; /* Уменьшил отступы */
        }

        .auth-header h1 {
          color: #1a3a5c;
          font-size: 20px; /* Уменьшил размер шрифта */
          margin-bottom: 12px; /* Уменьшил отступы */
        }

        .auth-mode-switch {
          display: flex;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e0e8f0;
          margin: 0 auto;
          max-width: 240px; /* Уменьшил ширину */
        }

        .auth-mode-switch button {
          flex: 1;
          background: none;
          border: none;
          padding: 8px 0; /* Уменьшил отступы */
          cursor: pointer;
          font-weight: 500;
          color: #647d98;
          transition: all 0.2s;
        }

        .auth-mode-switch button.active {
          background-color: #1a5f7a;
          color: white;
        }

        .auth-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 8px; /* Уменьшил отступы */
          border-radius: 6px;
          margin-bottom: 12px; /* Уменьшил отступы */
          font-size: 13px;
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 8px; /* Уменьшил отступы между полями */
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 2px; /* Добавил меньший отступ между группами */
        }

        .form-group label {
          margin-bottom: 2px; /* Уменьшил отступы */
          font-size: 13px;
          color: #647d98;
          font-weight: 500;
        }

        .form-group input {
          padding: 8px; /* Уменьшил отступы */
          border: 1px solid #e0e8f0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          border-color: #1a5f7a;
          outline: none;
        }

        .auth-submit {
          margin-top: 6px; /* Уменьшил отступы */
          padding: 10px; /* Уменьшил отступы */
          background-color: #1a5f7a;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .auth-submit:hover {
          background-color: #124759;
        }

        .auth-submit:disabled {
          background-color: #90a4ae;
          cursor: not-allowed;
        }

        /* Адаптивность */
        @media (max-width: 480px) {
          .auth-card {
            padding: 15px 12px;
          }
          
          .auth-header h1 {
            font-size: 18px;
          }
          
          .form-group input {
            padding: 8px;
          }
          
          .auth-submit {
            padding: 10px;
          }
        }
      `}} />
    </div>
  );
};

export default Auth;