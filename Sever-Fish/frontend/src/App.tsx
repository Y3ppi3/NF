
import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { checkAuth } = useAuth();
  const routesElement = useRoutes(routes);

  // Проверяем авторизацию при запуске приложения
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return routesElement;
};

export default App;