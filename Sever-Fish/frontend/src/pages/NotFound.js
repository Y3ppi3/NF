import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
const NotFound = () => {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center px-4", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-9xl font-bold text-blue-800", children: "404" }), _jsx("h2", { className: "text-3xl font-semibold mb-6", children: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430" }), _jsx("p", { className: "text-lg text-gray-600 mb-8 max-w-md mx-auto", children: "\u0418\u0437\u0432\u0438\u043D\u0438\u0442\u0435, \u0437\u0430\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u043C\u0430\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u0438\u043B\u0438 \u0431\u044B\u043B\u0430 \u043F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0430." }), _jsx(Link, { to: "/", children: _jsx(Button, { size: "lg", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E" }) })] }) }));
};
export default NotFound;
