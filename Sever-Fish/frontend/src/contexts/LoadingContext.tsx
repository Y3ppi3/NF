import React, { createContext, useState, useContext } from 'react';

// Тип для контекста загрузки
interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

// Создаем контекст с начальными значениями
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {}
});

// Хук для использования контекста загрузки
export const useLoading = () => useContext(LoadingContext);

// Свойства компонента провайдера контекста
interface LoadingProviderProps {
  children: React.ReactNode;
}

// Провайдер контекста загрузки
export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);

  // Увеличиваем счетчик загрузки и показываем индикатор
  const startLoading = () => {
    setLoadingCount(prev => prev + 1);
    setIsLoading(true);
  };

  // Уменьшаем счетчик загрузки и скрываем индикатор, когда счетчик достигает 0
  const stopLoading = () => {
    setLoadingCount(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsLoading(false);
        return 0;
      }
      return newCount;
    });
  };

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-gray-700">Загрузка...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;