import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useState, useContext } from 'react';
// Создаем контекст с начальными значениями
const LoadingContext = createContext({
    isLoading: false,
    startLoading: () => { },
    stopLoading: () => { }
});
// Хук для использования контекста загрузки
export const useLoading = () => useContext(LoadingContext);
// Провайдер контекста загрузки
export const LoadingProvider = ({ children }) => {
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
    return (_jsxs(LoadingContext.Provider, { value: { isLoading, startLoading, stopLoading }, children: [children, isLoading && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg flex items-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-3" }), _jsx("p", { className: "text-gray-700", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." })] }) }))] }));
};
export default LoadingProvider;
