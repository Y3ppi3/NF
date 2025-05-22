import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { OrderList } from '../components/order/OrderList';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
const Account = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
    const { orders, getOrders, loading: ordersLoading } = useOrders();
    const [activeTab, setActiveTab] = useState('profile');
    // Состояние для форм
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
    const [error, setError] = useState(null);
    // Проверяем авторизацию и загружаем данные
    useEffect(() => {
        if (!isAuthenticated && !authLoading) {
            navigate('/auth');
        }
        else if (isAuthenticated) {
            // Загружаем заказы пользователя
            getOrders();
        }
    }, [isAuthenticated, authLoading, navigate, getOrders]);
    // Обновляем форму при получении данных пользователя
    useEffect(() => {
        if (user) {
            setProfileForm({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);
    // Обработчик изменения формы профиля
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Обработчик изменения формы пароля
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Обработчик обновления профиля
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setProfileUpdateSuccess(false);
        try {
            // Здесь должен быть вызов API для обновления профиля
            // Например: await updateProfile(profileForm);
            // Имитация успешного обновления
            setTimeout(() => {
                setProfileUpdateSuccess(true);
            }, 500);
        }
        catch (err) {
            setError(err.message || 'Ошибка при обновлении профиля');
        }
    };
    // Обработчик изменения пароля
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setPasswordUpdateSuccess(false);
        // Проверка совпадения паролей
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError('Новый пароль и подтверждение не совпадают');
            return;
        }
        try {
            // Здесь должен быть вызов API для изменения пароля
            // Например: await changePassword(passwordForm);
            // Имитация успешного обновления
            setTimeout(() => {
                setPasswordUpdateSuccess(true);
                setPasswordForm({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }, 500);
        }
        catch (err) {
            setError(err.message || 'Ошибка при изменении пароля');
        }
    };
    if (authLoading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8 text-center text-blue-800", children: "\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442" }), _jsxs("div", { className: "flex border-b border-gray-200 mb-8", children: [_jsx("button", { className: `px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`, onClick: () => setActiveTab('profile'), children: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" }), _jsx("button", { className: `px-4 py-2 font-medium ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`, onClick: () => setActiveTab('orders'), children: "\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B" }), _jsx("button", { className: `px-4 py-2 font-medium ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`, onClick: () => setActiveTab('password'), children: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C" })] }), _jsxs("div", { className: "mb-8", children: [activeTab === 'profile' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-xl font-bold", children: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F" }) }), _jsxs(CardBody, { children: [error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded", children: error })), profileUpdateSuccess && (_jsx("div", { className: "mb-4 p-3 bg-green-100 text-green-700 rounded", children: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D" })), _jsx("form", { onSubmit: handleProfileUpdate, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0424\u0418\u041E" }), _jsx(Input, { type: "text", name: "full_name", value: profileForm.full_name, onChange: handleProfileChange, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx(Input, { type: "email", name: "email", value: profileForm.email, onChange: handleProfileChange, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx(Input, { type: "tel", name: "phone", value: profileForm.phone, onChange: handleProfileChange, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), _jsx(Input, { type: "text", name: "address", value: profileForm.address, onChange: handleProfileChange, fullWidth: true })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { type: "submit", fullWidth: true, children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" }) })] }) }), _jsx("div", { className: "mt-8 pt-6 border-t border-gray-200", children: _jsx(Button, { variant: "danger", onClick: logout, fullWidth: true, children: "\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430" }) })] })] })), activeTab === 'orders' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-xl font-bold", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u043E\u0432" }) }), _jsx(CardBody, { children: ordersLoading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) })) : (_jsx(OrderList, { orders: orders })) })] })), activeTab === 'password' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-xl font-bold", children: "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F" }) }), _jsxs(CardBody, { children: [error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded", children: error })), passwordUpdateSuccess && (_jsx("div", { className: "mb-4 p-3 bg-green-100 text-green-700 rounded", children: "\u041F\u0430\u0440\u043E\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0438\u0437\u043C\u0435\u043D\u0435\u043D" })), _jsx("form", { onSubmit: handlePasswordUpdate, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx(Input, { type: "password", name: "current_password", value: passwordForm.current_password, onChange: handlePasswordChange, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx(Input, { type: "password", name: "new_password", value: passwordForm.new_password, onChange: handlePasswordChange, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F" }), _jsx(Input, { type: "password", name: "confirm_password", value: passwordForm.confirm_password, onChange: handlePasswordChange, fullWidth: true })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { type: "submit", fullWidth: true, children: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C" }) })] }) })] })] }))] })] }));
};
export default Account;
