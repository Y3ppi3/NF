import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
const ProductDetails = () => {
    const { productId } = useParams();
    const { getProductById, currentProduct, loading, error } = useProducts();
    const { addToCart, loading: cartLoading } = useCart();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    useEffect(() => {
        if (productId) {
            getProductById(Number(productId));
        }
    }, [productId, getProductById]);
    const handleQuantityChange = (value) => {
        if (quantity + value > 0) {
            setQuantity(quantity + value);
        }
    };
    const handleAddToCart = async () => {
        if (currentProduct) {
            const success = await addToCart({
                product_id: currentProduct.id,
                quantity
            });
            if (success) {
                navigate('/cart');
            }
        }
    };
    if (loading) {
        return (_jsx("div", { className: "container mx-auto px-4 py-12 flex justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "container mx-auto px-4 py-12", children: [_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6", children: ["\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0442\u043E\u0432\u0430\u0440\u0430: ", error] }), _jsx(Button, { onClick: () => getProductById(Number(productId)), children: "\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430" })] }));
    }
    if (!currentProduct) {
        return (_jsxs("div", { className: "container mx-auto px-4 py-12 text-center", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "\u0422\u043E\u0432\u0430\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" }), _jsx(Link, { to: "/products", className: "text-blue-600 hover:text-blue-800", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0443" })] }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex items-center text-sm text-gray-500", children: [_jsx(Link, { to: "/", className: "hover:text-blue-600", children: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" }), _jsx("span", { className: "mx-2", children: "/" }), _jsx(Link, { to: "/products", className: "hover:text-blue-600", children: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433" }), _jsx("span", { className: "mx-2", children: "/" }), _jsx("span", { children: currentProduct.name })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [_jsx("div", { children: _jsx("div", { className: "bg-white p-4 rounded-lg shadow-md", children: _jsx("img", { src: currentProduct.image_url || '/images/products/default-product.jpg', alt: currentProduct.name, className: "w-full h-auto object-contain rounded", style: { maxHeight: '500px' }, onError: (e) => {
                                    e.target.src = '/images/products/default-product.jpg';
                                } }) }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-4 text-blue-900", children: currentProduct.name }), _jsx("div", { className: "text-2xl font-bold text-blue-600 mb-6", children: formatPrice(currentProduct.price) }), _jsx("div", { className: "mb-6", children: _jsx("div", { className: `inline-block px-3 py-1 rounded-full text-sm font-semibold ${currentProduct.is_available && currentProduct.stock > 0
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'}`, children: currentProduct.is_available && currentProduct.stock > 0
                                        ? 'В наличии'
                                        : 'Нет в наличии' }) }), currentProduct.description && (_jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435" }), _jsx("p", { className: "text-gray-700", children: currentProduct.description })] })), currentProduct.is_available && currentProduct.stock > 0 && (_jsx(Card, { className: "mb-6", children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("span", { className: "font-medium", children: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E:" }), _jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => handleQuantityChange(-1), className: "w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l", children: "-" }), _jsx("input", { type: "number", min: "1", value: quantity, onChange: (e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1)), className: "w-12 h-8 text-center border-t border-b border-gray-300" }), _jsx("button", { onClick: () => handleQuantityChange(1), className: "w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r", children: "+" })] })] }), _jsx(Button, { onClick: handleAddToCart, fullWidth: true, size: "lg", isLoading: cartLoading, children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443" })] }) })), _jsxs("div", { className: "space-y-4 text-sm", children: [_jsxs("div", { className: "flex", children: [_jsx("span", { className: "w-32 text-gray-600", children: "\u041A\u043E\u0434 \u0442\u043E\u0432\u0430\u0440\u0430:" }), _jsx("span", { className: "font-medium", children: currentProduct.id })] }), _jsxs("div", { className: "flex", children: [_jsx("span", { className: "w-32 text-gray-600", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F:" }), _jsx("span", { className: "font-medium", children: _jsxs(Link, { to: `/categories/${currentProduct.category_id}`, className: "text-blue-600 hover:text-blue-800", children: ["\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F ", currentProduct.category_id] }) })] })] })] })] })] }));
};
export default ProductDetails;
