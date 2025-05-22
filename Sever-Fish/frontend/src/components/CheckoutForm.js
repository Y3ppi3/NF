import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './CheckoutForm.css';
const PICKUP_LOCATIONS = [
    {
        id: 'ustjuzhenskaya',
        name: 'Север-Рыба',
        address: 'Устюженская ул., 8',
        phone: '+7 963 732-11-51',
        workingHours: 'Открыто ⋅ Закроется в 21:00'
    },
    {
        id: 'zarechenskiy',
        name: 'Север-Рыба',
        address: 'Мини-рынок "Зареченский", ул. Победы, 210',
        phone: '+7 820 251-71-09',
        workingHours: 'Открыто ⋅ Закроется в 21:00'
    },
    {
        id: 'gorodskoy-rynok',
        name: 'Северрыба',
        address: 'Городской рынок, ул. Максима Горького, 30',
        phone: '+7 963 732-11-51',
        workingHours: 'Открыто ⋅ Закроется в 19:00'
    },
    {
        id: 'pionerskaya',
        name: 'Север рыба',
        address: 'ул. Пионерская, 21',
        phone: '+7 963 732-11-51',
        workingHours: 'Открыто ⋅ Закроется в 21:00'
    },
    {
        id: 'medeo',
        name: 'Северрыба',
        address: 'ТЦ "Медео", ул. Победы, 107/1',
        phone: '+7 820 250-11-67',
        workingHours: 'Открыто ⋅ Закроется в 21:00'
    },
    {
        id: 'pervomayskaya',
        name: 'Северрыба',
        address: 'Первомайская ул., 21А',
        phone: '+7 820 224-00-79',
        workingHours: 'Открыто ⋅ Закроется в 20:00'
    }
];
const CheckoutForm = ({ onSubmit, onCancel, totalPrice, cartItems = [], prefillData }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'card',
        deliveryMethod: 'courier',
        comment: ''
    });
    const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    // Загрузка предварительных данных (остается без изменений)
    useEffect(() => {
        if (prefillData) {
            setFormData(prevData => ({
                ...prevData,
                firstName: prefillData.firstName || prevData.firstName,
                lastName: prefillData.lastName || prevData.lastName,
                email: prefillData.email || prevData.email,
                phone: prefillData.phone || prevData.phone,
            }));
        }
    }, [prefillData]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Если изменяется способ доставки, сбрасываем выбранный пункт самовывоза
        if (name === 'deliveryMethod') {
            setSelectedPickupLocation(null);
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку при изменении поля
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    const validateForm = () => {
        const errors = {};
        // Обязательные поля
        const requiredFields = [
            { field: 'firstName', label: 'Имя' },
            { field: 'lastName', label: 'Фамилия' },
            { field: 'email', label: 'Email' },
            { field: 'phone', label: 'Телефон' }
        ];
        // Проверка на заполнение обязательных полей
        requiredFields.forEach(({ field, label }) => {
            if (!formData[field]) {
                errors[field] = `Поле "${label}" обязательно для заполнения`;
            }
        });
        // Проверка email
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Некорректный формат email';
        }
        // Проверка телефона (упрощенная валидация)
        if (formData.phone && !/^\+?[0-9\s\(\)-]{10,15}$/.test(formData.phone)) {
            errors.phone = 'Телефон должен быть в корректном формате';
        }
        // Проверка адреса для доставки курьером
        if (formData.deliveryMethod === 'courier' && !formData.address) {
            errors.address = 'Укажите адрес доставки';
        }
        // Проверка пункта самовывоза
        if (formData.deliveryMethod === 'pickup' && !selectedPickupLocation) {
            errors.pickupLocation = 'Выберите пункт самовывоза';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handlePickupLocationSelect = (location) => {
        setSelectedPickupLocation(location);
        // Обновляем данные формы
        setFormData(prev => ({
            ...prev,
            address: location.address,
            pickupLocation: location.id
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (validateForm()) {
            try {
                // В случае самовывоза, используем адрес выбранного пункта
                const submissionData = formData.deliveryMethod === 'pickup'
                    ? {
                        ...formData,
                        city: 'Череповец',
                        address: selectedPickupLocation?.address || ''
                    }
                    : formData;
                // Если выбрана оплата картой, показываем форму оплаты
                if (formData.paymentMethod === 'card') {
                    setShowPaymentForm(true);
                }
                else {
                    // Для оплаты наличными сразу отправляем заказ
                    onSubmit(submissionData);
                }
            }
            catch (error) {
                console.error("Ошибка при оформлении заказа:", error);
                setValidationErrors({
                    general: "Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже."
                });
            }
            finally {
                setLoading(false);
            }
        }
        else {
            setLoading(false);
        }
    };
    // Остальные методы (handlePayment, formatPrice и т.д.) остаются без изменений
    const formatPrice = (price) => {
        return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + ' ₽';
    };
    // Форма оплаты картой и основная форма остаются без изменений
    // ... (предыдущая реализация)
    return (_jsxs("div", { className: "checkout-form-container", children: [_jsx("h2", { className: "checkout-title", children: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430" }), validationErrors.general && (_jsx("div", { className: "general-error", children: validationErrors.general })), _jsxs("form", { onSubmit: handleSubmit, className: "checkout-form", children: [_jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "\u041B\u0438\u0447\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "firstName", children: "\u0418\u043C\u044F*" }), _jsx("input", { type: "text", id: "firstName", name: "firstName", value: formData.firstName, onChange: handleChange, className: validationErrors.firstName ? 'error' : '', disabled: loading }), validationErrors.firstName && (_jsx("span", { className: "error-message", children: validationErrors.firstName }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "lastName", children: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F*" }), _jsx("input", { type: "text", id: "lastName", name: "lastName", value: formData.lastName, onChange: handleChange, className: validationErrors.lastName ? 'error' : '', disabled: loading }), validationErrors.lastName && (_jsx("span", { className: "error-message", children: validationErrors.lastName }))] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email*" }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleChange, className: validationErrors.email ? 'error' : '', disabled: loading }), validationErrors.email && (_jsx("span", { className: "error-message", children: validationErrors.email }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "phone", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D*" }), _jsx("input", { type: "tel", id: "phone", name: "phone", value: formData.phone, onChange: handleChange, placeholder: "+7 (___) ___-__-__", className: validationErrors.phone ? 'error' : '', disabled: loading }), validationErrors.phone && (_jsx("span", { className: "error-message", children: validationErrors.phone }))] })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u0421\u043F\u043E\u0441\u043E\u0431 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), _jsxs("div", { className: "radio-group", children: [_jsxs("label", { className: "radio-label", children: [_jsx("input", { type: "radio", name: "deliveryMethod", value: "courier", checked: formData.deliveryMethod === 'courier', onChange: handleChange, disabled: loading }), "\u041A\u0443\u0440\u044C\u0435\u0440\u043E\u043C"] }), _jsxs("label", { className: "radio-label", children: [_jsx("input", { type: "radio", name: "deliveryMethod", value: "pickup", checked: formData.deliveryMethod === 'pickup', onChange: handleChange, disabled: loading }), "\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437"] })] })] }), formData.deliveryMethod === 'courier' && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "address", children: "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438*" }), _jsx("input", { type: "text", id: "address", name: "address", value: formData.address, onChange: handleChange, className: validationErrors.address ? 'error' : '', disabled: loading, placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u043E\u043B\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), validationErrors.address && (_jsx("span", { className: "error-message", children: validationErrors.address }))] })), formData.deliveryMethod === 'pickup' && (_jsxs("div", { className: "pickup-locations", children: [_jsx("h4", { children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0443\u043D\u043A\u0442 \u0441\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437\u0430" }), PICKUP_LOCATIONS.map(location => (_jsxs("div", { className: `pickup-location ${selectedPickupLocation?.id === location.id ? 'selected' : ''}`, onClick: () => handlePickupLocationSelect(location), children: [_jsxs("div", { className: "pickup-location-header", children: [_jsx("h5", { children: location.name }), selectedPickupLocation?.id === location.id && (_jsx("span", { className: "selected-badge", children: "\u2713" }))] }), _jsx("p", { children: location.address }), _jsx("p", { className: "pickup-hours", children: location.workingHours }), _jsx("p", { className: "pickup-phone", children: location.phone })] }, location.id))), validationErrors.pickupLocation && (_jsx("span", { className: "error-message", children: validationErrors.pickupLocation }))] }))] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "\u041E\u043F\u043B\u0430\u0442\u0430" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u0421\u043F\u043E\u0441\u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u044B" }), _jsxs("div", { className: "radio-group", children: [_jsxs("label", { className: "radio-label", children: [_jsx("input", { type: "radio", name: "paymentMethod", value: "card", checked: formData.paymentMethod === 'card', onChange: handleChange, disabled: loading }), "\u041A\u0430\u0440\u0442\u043E\u0439 \u043E\u043D\u043B\u0430\u0439\u043D"] }), _jsxs("label", { className: "radio-label", children: [_jsx("input", { type: "radio", name: "paymentMethod", value: "cash", checked: formData.paymentMethod === 'cash', onChange: handleChange, disabled: loading }), formData.deliveryMethod === 'pickup'
                                                        ? 'Наличными при получении'
                                                        : 'Наличными курьеру'] })] })] })] }), cartItems.length > 0 && (_jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "\u0412\u0430\u0448 \u0437\u0430\u043A\u0430\u0437" }), _jsx("div", { className: "order-items", children: cartItems.map(item => (_jsxs("div", { className: "order-item", children: [_jsx("span", { className: "order-item-name", children: item.product.name }), _jsxs("span", { className: "order-item-quantity", children: [item.quantity, " \u0448\u0442."] }), _jsx("span", { className: "order-item-price", children: formatPrice(item.product.price * item.quantity) })] }, item.id))) })] })), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043A \u0437\u0430\u043A\u0430\u0437\u0443" }), _jsx("div", { className: "form-group", children: _jsx("textarea", { name: "comment", value: formData.comment, onChange: handleChange, rows: 3, placeholder: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043A \u0437\u0430\u043A\u0430\u0437\u0443, \u0435\u0441\u043B\u0438 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E", disabled: loading }) })] }), _jsx("div", { className: "order-summary", children: _jsxs("h3", { children: ["\u0418\u0442\u043E\u0433\u043E \u043A \u043E\u043F\u043B\u0430\u0442\u0435: ", _jsx("span", { className: "total-amount", children: formatPrice(totalPrice) })] }) }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", className: "cancel-button", onClick: onCancel, disabled: loading, children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443" }), _jsx("button", { type: "submit", className: "submit-button", disabled: loading, children: loading ? "Оформление заказа..." : "Подтвердить заказ" })] })] }), showPaymentForm && (_jsx("div", { className: "payment-form-overlay" }))] }));
};
export default CheckoutForm;
