import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
const Header = ({ onMenuToggle, cartCount, updateCartCount }) => {
    // Используем useCallback для предотвращения пересоздания функции при каждом рендере
    const safeUpdateCartCount = useCallback(() => {
        try {
            updateCartCount();
        }
        catch (error) {
            console.error('Ошибка при обновлении корзины:', error);
            // Игнорируем ошибку и продолжаем работу
        }
    }, [updateCartCount]);
    useEffect(() => {
        // Периодическое обновление корзины с более длинным интервалом
        const interval = setInterval(() => {
            safeUpdateCartCount();
        }, 60000); // обновлять корзину каждую минуту вместо 30 секунд
        return () => clearInterval(interval);
    }, [safeUpdateCartCount]);
    return (_jsx("header", { className: "bg-white shadow-md sticky top-0 z-30", children: _jsxs("div", { className: "container mx-auto px-4 py-3 flex justify-between items-center", children: [_jsx("div", { className: "w-1/3 flex justify-start", children: _jsx("button", { className: "p-2 hover:bg-gray-100 rounded-full transition-colors", onClick: onMenuToggle, "aria-label": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E", children: _jsx("svg", { className: "w-6 h-6 text-gray-700", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }) }), _jsx("div", { className: "w-1/3 flex justify-center", children: _jsx(Link, { to: "/", className: "flex items-center", children: _jsx("img", { src: "/images/logo.png", alt: "\u0421\u0435\u0432\u0435\u0440-\u0420\u044B\u0431\u0430", className: "h-16" }) }) }), _jsxs("div", { className: "w-1/3 flex justify-end items-center space-x-4", children: [_jsxs(Link, { to: "/cart", className: "relative p-2 hover:bg-gray-100 rounded-full transition-colors", children: [_jsx("svg", { className: "w-6 h-6 text-gray-700", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" }) }), cartCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center", children: cartCount > 9 ? '9+' : cartCount }))] }), _jsx(Link, { to: "/auth", className: "p-2 hover:bg-gray-100 rounded-full transition-colors", children: _jsx("svg", { className: "w-6 h-6 text-gray-700", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) })] })] }) }));
};
export default Header;
