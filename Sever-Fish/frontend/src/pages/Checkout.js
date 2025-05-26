import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { formatPrice } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
const Checkout = () => {
    const navigate = useNavigate();
    const { items, totalItems, totalAmount, getCart, loading: cartLoading } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { createOrder, loading: orderLoading } = useOrders();
    // Состояние формы оформления заказа
    const [checkoutForm, setCheckoutForm] = useState({
        shipping_address: '',
        contact_phone: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    // Проверяем авторизацию и загружаем корзину
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
        else {
            getCart();
        }
    }, [isAuthenticated, navigate, getCart]);
    // Заполняем адрес и телефон из профиля пользователя
    useEffect(() => {
        if (user) {
            setCheckoutForm(prev => ({
                ...prev,
                shipping_address: user.address || '',
                contact_phone: user.phone || ''
            }));
        }
    }, [user]);
    // Если корзина пуста, перенаправляем на страницу корзины
    useEffect(() => {
        if (!cartLoading && items.length === 0) {
            navigate('/cart');
        }
    }, [items, cartLoading, navigate]);
    // Обработчик изменения формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCheckoutForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Валидация формы
    const validateForm = () => {
        const newErrors = {};
        if (!checkoutForm.shipping_address.trim()) {
            newErrors.shipping_address = 'Введите адрес доставки';
        }
        if (!checkoutForm.contact_phone.trim()) {
            newErrors.contact_phone = 'Введите контактный телефон';
        }
        else if (!/^\+?[0-9]{10,12}$/.test(checkoutForm.contact_phone.trim())) {
            newErrors.contact_phone = 'Введите корректный номер телефона';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        await createOrder({
            shipping_address: checkoutForm.shipping_address,
            contact_phone: checkoutForm.contact_phone,
        });
    };
    if (cartLoading) {
        return (_jsx("div", { className: "container mx-auto px-4 py-12 flex justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8 text-center text-blue-800", children: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [_jsx("div", { className: "md:col-span-2", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-xl font-bold", children: "\u0414\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }) }), _jsx(CardBody, { children: _jsx("form", { onSubmit: handleSubmit, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438*" }), _jsx(Input, { type: "text", name: "shipping_address", value: checkoutForm.shipping_address, onChange: handleChange, error: errors.shipping_address, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u044B\u0439 \u0442\u0435\u043B\u0435\u0444\u043E\u043D*" }), _jsx(Input, { type: "tel", name: "contact_phone", value: checkoutForm.contact_phone, onChange: handleChange, error: errors.contact_phone, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435 \u043A \u0437\u0430\u043A\u0430\u0437\u0443" }), _jsx("textarea", { name: "notes", value: checkoutForm.notes, onChange: handleChange, className: "px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 w-full", rows: 4 })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { type: "submit", size: "lg", fullWidth: true, isLoading: orderLoading, children: "\u041E\u0444\u043E\u0440\u043C\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }) })] }) }) })] }) }), _jsx("div", { className: "md:col-span-1", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-xl font-bold", children: "\u0412\u0430\u0448 \u0437\u0430\u043A\u0430\u0437" }) }), _jsx(CardBody, { children: _jsxs("div", { className: "space-y-4", children: [items.map((item) => (_jsxs("div", { className: "flex justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: item.product?.name }), _jsxs("div", { className: "text-sm text-gray-600", children: [item.quantity, " \u0448\u0442. \u00D7 ", formatPrice(item.product?.price || 0)] })] }), _jsx("div", { className: "font-medium", children: formatPrice((item.product?.price || 0) * item.quantity) })] }, item.id))), _jsxs("div", { className: "border-t border-gray-200 pt-4 mt-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "\u0412\u0441\u0435\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u043E\u0432:" }), _jsx("span", { children: totalItems })] }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("span", { className: "font-bold text-lg", children: "\u0418\u0442\u043E\u0433\u043E:" }), _jsx("span", { className: "font-bold text-lg text-blue-600", children: formatPrice(totalAmount) })] })] })] }) })] }) })] })] }));
};
export default Checkout;
