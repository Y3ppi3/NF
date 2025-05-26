import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children }) => {
    return _jsx("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: children });
};
// Добавляем экспорт CardContent
export const CardContent = ({ children }) => {
    return _jsx("div", { className: "p-4", children: children });
};
