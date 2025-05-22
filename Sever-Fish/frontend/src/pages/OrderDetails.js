import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrderSummary } from '../components/order/OrderSummary';
import { Button } from '../components/ui/Button';
const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { getOrderById, currentOrder, loading, error, cancelOrder } = useOrders();
    useEffect(() => {
        if (orderId) {
            getOrderById(Number(orderId));
        }
    }, [orderId, getOrderById]);
    const handleCancelOrder = async () => {
        if (!currentOrder)
            return;
        if (window.confirm('Вы уверены, что хотите отменить этот заказ?')) {
            const success = await cancelOrder(currentOrder.id);
            if (success) {
                // Перезагружаем данные заказа
                getOrderById(currentOrder.id);
            }
        }
    };
    if (loading) {
        return (_jsx("div", { className: "container mx-auto px-4 py-12 flex justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6", children: ["\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0437\u0430\u043A\u0430\u0437\u0430: ", error] }), _jsx(Button, { onClick: () => navigate('/orders'), children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0441\u043F\u0438\u0441\u043A\u0443 \u0437\u0430\u043A\u0430\u0437\u043E\u0432" })] }));
    }
    if (!currentOrder) {
        return (_jsxs("div", { className: "container mx-auto px-4 py-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "\u0417\u0430\u043A\u0430\u0437 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" }), _jsx(Link, { to: "/orders", className: "text-blue-600 hover:text-blue-800", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0441\u043F\u0438\u0441\u043A\u0443 \u0437\u0430\u043A\u0430\u0437\u043E\u0432" })] }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex items-center text-sm text-gray-500", children: [_jsx(Link, { to: "/", className: "hover:text-blue-600", children: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" }), _jsx("span", { className: "mx-2", children: "/" }), _jsx(Link, { to: "/orders", className: "hover:text-blue-600", children: "\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B" }), _jsx("span", { className: "mx-2", children: "/" }), _jsxs("span", { children: ["\u0417\u0430\u043A\u0430\u0437 #", currentOrder.id] })] }), _jsxs("h1", { className: "text-3xl font-bold mb-8 text-center text-blue-800", children: ["\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435 #", currentOrder.id] }), _jsx(OrderSummary, { order: currentOrder }), _jsxs("div", { className: "flex justify-center mt-8 space-x-4", children: [_jsx(Button, { onClick: () => navigate('/orders'), variant: "outline", children: "\u041D\u0430\u0437\u0430\u0434 \u043A \u0441\u043F\u0438\u0441\u043A\u0443 \u0437\u0430\u043A\u0430\u0437\u043E\u0432" }), currentOrder.status === 'pending' && (_jsx(Button, { onClick: handleCancelOrder, variant: "danger", children: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }))] })] }));
};
export default OrderDetails;
