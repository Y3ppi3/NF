import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrderList } from '../components/order/OrderList';
import { Button } from '../components/ui/Button';
const Orders = () => {
    const { orders, getOrders, loading, error } = useOrders();
    useEffect(() => {
        getOrders();
    }, [getOrders]);
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8 text-center text-blue-800", children: "\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B" }), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" }) })) : error ? (_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6", children: ["\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0437\u0430\u043A\u0430\u0437\u043E\u0432: ", error, _jsx("div", { className: "mt-4", children: _jsx(Button, { onClick: getOrders, children: "\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430" }) })] })) : (_jsx(_Fragment, { children: orders.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "w-16 h-16 mx-auto text-gray-300 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), _jsx("h2", { className: "text-xl font-semibold mb-4", children: "\u0423 \u0432\u0430\u0441 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432" }), _jsx("p", { className: "text-gray-500 mb-8", children: "\u0412\u043E\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435\u0441\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u043E\u043C, \u0447\u0442\u043E\u0431\u044B \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0437" }), _jsx(Link, { to: "/products", children: _jsx(Button, { children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433" }) })] })) : (_jsx(OrderList, { orders: orders })) }))] }));
};
export default Orders;
