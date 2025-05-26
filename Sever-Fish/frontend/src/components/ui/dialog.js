import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50", children: _jsxs("div", { className: "bg-white p-6 rounded shadow-lg", children: [children, _jsx("button", { className: "mt-4 bg-gray-300 px-4 py-2 rounded", onClick: onClose, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }) }));
};
// Добавляем экспорт DialogContent
export const DialogContent = ({ children }) => {
    return _jsx("div", { className: "p-4", children: children });
};
// Добавляем экспорт DialogTrigger (если нужен)
export const DialogTrigger = ({ onClick, children }) => {
    return (_jsx("button", { onClick: onClick, className: "bg-blue-500 text-white px-4 py-2 rounded", children: children }));
};
