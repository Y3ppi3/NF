import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-800">404</h1>
        <h2 className="text-3xl font-semibold mb-6">Страница не найдена</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Извините, запрашиваемая страница не существует или была перемещена.
        </p>
        <Link to="/">
          <Button size="lg">Вернуться на главную</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;