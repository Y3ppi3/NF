import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
const MobileMenu = ({ isOpen, setIsOpen }) => {
    // Функция закрытия меню
    const handleClose = () => {
        setIsOpen(false);
    };
    // Предотвращаем скролл при открытом меню
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);
    // Добавляем обработчик для клавиши Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-40", onClick: handleClose, "aria-hidden": "true" })), _jsxs("div", { className: `fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`, children: [_jsxs("div", { className: "flex justify-between items-center p-4 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-bold text-blue-900", children: "\u041C\u0415\u041D\u042E" }), _jsx("button", { className: "text-gray-500 hover:text-gray-700", onClick: handleClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("nav", { className: "p-4", children: _jsxs("ul", { className: "space-y-4", children: [_jsx("li", { children: _jsx(Link, { to: "/", className: "block text-gray-700 hover:text-blue-800 font-medium uppercase", onClick: handleClose, children: "\u0413\u041B\u0410\u0412\u041D\u0410\u042F" }) }), _jsx("li", { children: _jsx(Link, { to: "/products", className: "block text-gray-700 hover:text-blue-800 font-medium uppercase", onClick: handleClose, children: "\u041F\u0420\u041E\u0414\u0423\u041A\u0426\u0418\u042F" }) }), _jsx("li", { children: _jsx(Link, { to: "/production", className: "block text-gray-700 hover:text-blue-800 font-medium uppercase", onClick: handleClose, children: "\u041F\u0420\u041E\u0418\u0417\u0412\u041E\u0414\u0421\u0422\u0412\u041E" }) }), _jsx("li", { children: _jsx(Link, { to: "/recipes", className: "block text-gray-700 hover:text-blue-800 font-medium uppercase", onClick: handleClose, children: "\u0420\u0415\u0426\u0415\u041F\u0422\u042B" }) }), _jsx("li", { children: _jsx(Link, { to: "/about", className: "block text-gray-700 hover:text-blue-800 font-medium uppercase", onClick: handleClose, children: "\u041E \u041D\u0410\u0421" }) }), _jsx("li", { children: _jsx(Link, { to: "/contacts", className: "block text-gray-700 hover:text-blue-800 font-medium uppercase", onClick: handleClose, children: "\u041A\u041E\u041D\u0422\u0410\u041A\u0422\u042B" }) })] }) }), _jsx("div", { className: "p-4 mt-4", children: _jsx(Link, { to: "/contacts", className: "block w-full text-center px-4 py-2 border border-blue-800 text-blue-800 font-medium rounded hover:bg-blue-800 hover:text-white transition-colors", onClick: handleClose, children: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043D\u0430\u043C\u0438" }) })] })] }));
};
export default MobileMenu;
