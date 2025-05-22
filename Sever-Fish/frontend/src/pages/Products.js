import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { ProductList } from '../components/product/ProductList';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, categories, loading, error, getProducts, getCategories } = useProducts();
    const { getCart } = useCart();
    // Состояние для фильтров
    const [filter, setFilter] = useState({
        category_id: searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
        search: searchParams.get('search') || '',
        min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
        max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
        in_stock: searchParams.get('in_stock') === 'true'
    });
    // Загружаем товары и категории при монтировании компонента
    useEffect(() => {
        getProducts(filter);
        getCategories();
        getCart();
    }, [getProducts, getCategories, getCart]);
    // Обработчик изменения фильтров
    const handleFilterChange = (name, value) => {
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Применение фильтров
    const applyFilters = () => {
        // Обновляем URL с новыми параметрами фильтрации
        const params = {};
        if (filter.category_id)
            params.category = filter.category_id.toString();
        if (filter.search)
            params.search = filter.search;
        if (filter.min_price)
            params.min_price = filter.min_price.toString();
        if (filter.max_price)
            params.max_price = filter.max_price.toString();
        if (filter.in_stock)
            params.in_stock = filter.in_stock.toString();
        setSearchParams(params);
        // Загружаем товары с новыми фильтрами
        getProducts(filter);
    };
    // Сброс фильтров
    const resetFilters = () => {
        setFilter({
            category_id: undefined,
            search: '',
            min_price: undefined,
            max_price: undefined,
            in_stock: false
        });
        setSearchParams({});
        getProducts({});
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8 text-center text-blue-800", children: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438" }), _jsxs("div", { className: "grid md:grid-cols-4 gap-8", children: [_jsx("div", { className: "md:col-span-1", children: _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "\u0424\u0438\u043B\u044C\u0442\u0440\u044B" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u043E\u0438\u0441\u043A" }), _jsx(Input, { type: "text", placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0442\u043E\u0432\u0430\u0440\u0430", value: filter.search || '', onChange: (e) => handleFilterChange('search', e.target.value), fullWidth: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300", value: filter.category_id || '', onChange: (e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined), children: [_jsx("option", { value: "", children: "\u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }), categories.map(category => (_jsx("option", { value: category.id, children: category.name }, category.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0426\u0435\u043D\u0430" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Input, { type: "number", placeholder: "\u041E\u0442", value: filter.min_price || '', onChange: (e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined) }), _jsx(Input, { type: "number", placeholder: "\u0414\u043E", value: filter.max_price || '', onChange: (e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined) })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "in_stock", checked: filter.in_stock || false, onChange: (e) => handleFilterChange('in_stock', e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("label", { htmlFor: "in_stock", className: "ml-2 block text-sm text-gray-700", children: "\u0422\u043E\u043B\u044C\u043A\u043E \u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438" })] }), _jsxs("div", { className: "flex flex-col space-y-2 pt-4", children: [_jsx(Button, { onClick: applyFilters, fullWidth: true, children: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B" }), _jsx(Button, { onClick: resetFilters, variant: "outline", fullWidth: true, children: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B" })] })] })] }) }) }), _jsx("div", { className: "md:col-span-3", children: _jsx(ProductList, {}) })] })] }));
};
export default Products;
