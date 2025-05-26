import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../utils/formatters';
const OrderSuccess = () => {
    const { orderId } = useParams();
    const { getOrderById, currentOrder, loading } = useOrders();
    useEffect(() => {
        if (orderId) {
            getOrderById(Number(orderId));
        }
    }, [orderId, getOrderById]);
    if (loading) {
        return (_jsx("div", { className: "container mx-auto px-4 py-12 flex justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) }));
    }
    return (_jsx("div", { className: "container mx-auto px-4 py-8 text-center", children: _jsxs("div", { className: "bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto", children: [_jsx("div", { className: "mb-6 text-green-600", children: _jsx("svg", { className: "w-20 h-20 mx-auto", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }), _jsx("h1", { className: "text-3xl font-bold mb-4 text-gray-800", children: "\u0417\u0430\u043A\u0430\u0437 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D!" }), currentOrder ? (_jsxs("div", { className: "mb-8", children: [_jsxs("p", { className: "text-lg mb-2", children: ["\u041D\u043E\u043C\u0435\u0440 \u0432\u0430\u0448\u0435\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u0430: ", _jsxs("strong", { children: ["#", currentOrder.id] })] }), _jsxs("p", { className: "text-lg", children: ["\u0421\u0443\u043C\u043C\u0430 \u0437\u0430\u043A\u0430\u0437\u0430: ", _jsx("strong", { children: formatPrice(currentOrder.total_amount) })] })] })) : (_jsx("p", { className: "text-lg mb-8", children: "\u0412\u0430\u0448 \u0437\u0430\u043A\u0430\u0437 \u0431\u044B\u043B \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D \u0438 \u043F\u0440\u0438\u043D\u044F\u0442 \u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443." })), _jsx("p", { className: "text-gray-600 mb-8", children: "\u041C\u044B \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043D\u0430 \u0432\u0430\u0448\u0443 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0443\u044E \u043F\u043E\u0447\u0442\u0443. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430 \u0432 \u043B\u0438\u0447\u043D\u043E\u043C \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435." }), _jsxs("div", { className: "flex flex-col md:flex-row justify-center gap-4", children: [_jsx(Link, { to: "/orders", children: _jsx(Button, { children: "\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B" }) }), _jsx(Link, { to: "/products", children: _jsx(Button, { variant: "outline", children: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0438" }) })] })] }) }));
};
export default OrderSuccess;
