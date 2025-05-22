import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { CartItemComponent } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { Button } from '../components/ui/Button';
// Компонент уведомления о необходимости авторизации
const AuthNotification = () => {
    const navigate = useNavigate();
    return (_jsx("div", { className: "cart-container", children: _jsxs("div", { className: "auth-notification p-8 bg-white rounded-lg shadow-md text-center", children: [_jsx("h2", { className: "text-xl font-bold mb-4 text-blue-800", children: "\u0414\u043B\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u043A\u043E\u0440\u0437\u0438\u043D\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0432\u043E\u0439\u0442\u0438 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442" }), _jsx("p", { className: "mb-6 text-gray-600", children: "\u0427\u0442\u043E\u0431\u044B \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 \u0438 \u043E\u0444\u043E\u0440\u043C\u043B\u044F\u0442\u044C \u0437\u0430\u043A\u0430\u0437\u044B, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0443\u0439\u0442\u0435\u0441\u044C" }), _jsx(Button, { onClick: () => navigate('/auth'), size: "lg", children: "\u0412\u043E\u0439\u0442\u0438 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442" })] }) }));
};
// Компонент пустой корзины
const EmptyCart = () => {
    return (_jsxs("div", { className: "py-8 text-center", children: [_jsx("div", { className: "mb-6", children: _jsx("svg", { className: "w-24 h-24 mx-auto text-gray-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" }) }) }), _jsx("h2", { className: "text-xl font-semibold mb-4 text-gray-700", children: "\u0412\u0430\u0448\u0430 \u043A\u043E\u0440\u0437\u0438\u043D\u0430 \u043F\u0443\u0441\u0442\u0430" }), _jsx("p", { className: "text-gray-500 mb-8", children: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443, \u0447\u0442\u043E\u0431\u044B \u043E\u0444\u043E\u0440\u043C\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }), _jsx(Link, { to: "/products", children: _jsx(Button, { variant: "primary", children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0443" }) })] }));
};
// Основной компонент корзины
const Cart = () => {
    const { items, totalItems, getCart, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    // Загружаем корзину при монтировании компонента
    useEffect(() => {
        if (isAuthenticated) {
            getCart();
        }
    }, [isAuthenticated, getCart]);
    // Если пользователь не авторизован, показываем уведомление
    if (!isAuthenticated) {
        return _jsx(AuthNotification, {});
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-2xl font-bold mb-8 text-center text-blue-800", children: "\u041A\u043E\u0440\u0437\u0438\u043D\u0430" }), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) })) : totalItems === 0 ? (_jsx(EmptyCart, {})) : (_jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [_jsx("div", { className: "md:col-span-2", children: _jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: _jsx("div", { className: "cart-items space-y-6", children: items.map((item) => (_jsx(CartItemComponent, { item: item }, item.id))) }) }) }), _jsx("div", { className: "md:col-span-1", children: _jsx(CartSummary, {}) })] }))] }));
};
export default Cart;
