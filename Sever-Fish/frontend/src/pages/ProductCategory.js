import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductList } from '../components/product/ProductList';
const CategoryProducts = () => {
    const { categoryId } = useParams();
    const { getProductsByCategory, categories, loading, error } = useProducts();
    useEffect(() => {
        if (categoryId) {
            getProductsByCategory(Number(categoryId));
        }
    }, [categoryId, getProductsByCategory]);
    // Находим текущую категорию
    const currentCategory = categories.find(cat => cat.id === Number(categoryId));
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex items-center text-sm text-gray-500", children: [_jsx(Link, { to: "/", className: "hover:text-blue-600", children: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" }), _jsx("span", { className: "mx-2", children: "/" }), _jsx(Link, { to: "/products", className: "hover:text-blue-600", children: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433" }), _jsx("span", { className: "mx-2", children: "/" }), _jsx("span", { children: currentCategory?.name || 'Категория' })] }), _jsx("h1", { className: "text-3xl font-bold mb-8 text-center text-blue-800", children: currentCategory?.name || 'Товары категории' }), error ? (_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6", children: ["\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438: ", error] })) : (_jsx(ProductList, { categoryId: Number(categoryId) }))] }));
};
export default CategoryProducts;
