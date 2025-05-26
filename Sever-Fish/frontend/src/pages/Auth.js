import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators';
const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register, error: authError, loading } = useAuth();
    const navigate = useNavigate();
    // Состояние для форм
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: ''
    });
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        full_name: ''
    });
    const [errors, setErrors] = useState({});
    // Обработчик изменения формы входа
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Обработчик изменения формы регистрации
    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Валидация формы входа
    const validateLoginForm = () => {
        const newErrors = {};
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
        const newErrors = {};
        if (!registerForm.username) {
            newErrors.username = 'Введите имя пользователя';
        }
        else if (!isValidUsername(registerForm.username)) {
            newErrors.username = 'Имя пользователя должно содержать от 3 до 20 символов (буквы, цифры, _)';
        }
        if (!registerForm.email) {
            newErrors.email = 'Введите email';
        }
        else if (!isValidEmail(registerForm.email)) {
            newErrors.email = 'Введите корректный email';
        }
        if (!registerForm.password) {
            newErrors.password = 'Введите пароль';
        }
        else if (!isValidPassword(registerForm.password)) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }
        if (registerForm.password !== registerForm.confirm_password) {
            newErrors.confirm_password = 'Пароли не совпадают';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Обработчик отправки формы входа
    const handleLoginSubmit = async (e) => {
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
    const handleRegisterSubmit = async (e) => {
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
    return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsx(CardHeader, { children: _jsx("h1", { className: "text-2xl font-bold text-center", children: isLogin ? 'Вход в аккаунт' : 'Регистрация' }) }), _jsxs(CardBody, { children: [authError && (_jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded", children: authError })), isLogin ? (_jsx("form", { onSubmit: handleLoginSubmit, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0438\u043B\u0438 Email" }), _jsx(Input, { type: "text", name: "username", value: loginForm.username, onChange: handleLoginChange, error: errors.username, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u0430\u0440\u043E\u043B\u044C" }), _jsx(Input, { type: "password", name: "password", value: loginForm.password, onChange: handleLoginChange, error: errors.password, fullWidth: true })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { type: "submit", fullWidth: true, isLoading: loading, children: "\u0412\u043E\u0439\u0442\u0438" }) })] }) })) : (_jsx("form", { onSubmit: handleRegisterSubmit, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" }), _jsx(Input, { type: "text", name: "username", value: registerForm.username, onChange: handleRegisterChange, error: errors.username, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx(Input, { type: "email", name: "email", value: registerForm.email, onChange: handleRegisterChange, error: errors.email, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0424\u0418\u041E (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)" }), _jsx(Input, { type: "text", name: "full_name", value: registerForm.full_name, onChange: handleRegisterChange, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u0430\u0440\u043E\u043B\u044C" }), _jsx(Input, { type: "password", name: "password", value: registerForm.password, onChange: handleRegisterChange, error: errors.password, fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F" }), _jsx(Input, { type: "password", name: "confirm_password", value: registerForm.confirm_password, onChange: handleRegisterChange, error: errors.confirm_password, fullWidth: true })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { type: "submit", fullWidth: true, isLoading: loading, children: "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F" }) })] }) })), _jsx("div", { className: "mt-6 text-center", children: _jsx("button", { type: "button", className: "text-blue-600 hover:text-blue-800", onClick: () => setIsLogin(!isLogin), children: isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }) })] })] }));
};
export default Auth;
