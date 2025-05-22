import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Link } from 'react-router-dom';
const ProductCard = ({ id, name, price, image, category, weight, isNew = false, isPopular = false, onAddToCart }) => {
    // Хук для отслеживания состояния добавления в корзину
    const [isAdding, setIsAdding] = React.useState(false);
    // Обработчик добавления в корзину
    const handleAddToCart = (e) => {
        e.preventDefault(); // Предотвращаем переход по ссылке
        e.stopPropagation(); // Предотвращаем всплытие события
        setIsAdding(true);
        onAddToCart(id);
        // Возвращаем кнопку в исходное состояние через 1 секунду
        setTimeout(() => {
            setIsAdding(false);
        }, 1000);
    };
    // Форматирование цены
    const formatPrice = (price) => {
        if (Number.isInteger(price)) {
            return `${price} ₽`;
        }
        return `${price.toFixed(2)} ₽`;
    };
    // Генерация URL изображения по умолчанию в случае ошибки
    const defaultImage = '/images/products/default-product.jpg';
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col", children: [_jsxs("div", { className: "relative", children: [isNew && (_jsx("div", { className: "absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10", children: "\u041D\u043E\u0432\u0438\u043D\u043A\u0430" })), isPopular && (_jsx("div", { className: "absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10", children: "\u0425\u0438\u0442 \u043F\u0440\u043E\u0434\u0430\u0436" })), _jsx(Link, { to: `/products/${id}`, className: "block", children: _jsx("div", { className: "h-48 overflow-hidden", children: _jsx("img", { src: image || defaultImage, alt: name, className: "w-full h-full object-cover transform hover:scale-105 transition-transform duration-300", onError: (e) => {
                                    const target = e.target;
                                    if (target.src !== defaultImage) {
                                        target.src = defaultImage;
                                    }
                                } }) }) })] }), _jsxs("div", { className: "p-4 flex-1 flex flex-col", children: [_jsxs("div", { className: "mb-auto", children: [_jsx(Link, { to: `/products/${id}`, className: "block", children: _jsx("h3", { className: "text-lg font-medium text-gray-800 hover:text-blue-800 transition-colors", children: name }) }), category && (_jsx(Link, { to: `/products/category/${category.slug}`, className: "text-xs text-gray-500 hover:text-blue-500 transition-colors", children: category.name })), weight && _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["\u0412\u0435\u0441: ", weight] })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between", children: [_jsx("span", { className: "text-xl font-bold text-blue-900", children: formatPrice(price) }), _jsx("button", { onClick: handleAddToCart, disabled: isAdding, className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${isAdding
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-700 text-white hover:bg-blue-800'}`, children: isAdding ? '✓ Добавлено' : 'В корзину' })] })] })] }));
};
export default ProductCard;
