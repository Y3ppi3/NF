import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
const DesktopSidebar = ({ onNavigate }) => {
    const location = useLocation();
    // Function to check if a link is active
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };
    return (_jsx("div", { className: "hidden md:block w-64 min-h-screen bg-white shadow-md", children: _jsxs("div", { className: "p-6 sticky top-24", children: [_jsx("h2", { className: "text-xl font-bold text-blue-900 mb-6", children: "\u041C\u0415\u041D\u042E" }), _jsx("nav", { children: _jsxs("ul", { className: "space-y-4", children: [_jsx("li", { children: _jsx(Link, { to: "/", className: `block font-medium text-base uppercase ${isActive('/')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'}`, onClick: onNavigate, children: "\u0413\u041B\u0410\u0412\u041D\u0410\u042F" }) }), _jsx("li", { children: _jsx(Link, { to: "/products", className: `block font-medium text-base uppercase ${isActive('/products')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'}`, onClick: onNavigate, children: "\u041F\u0420\u041E\u0414\u0423\u041A\u0426\u0418\u042F" }) }), _jsx("li", { children: _jsx(Link, { to: "/production", className: `block font-medium text-base uppercase ${isActive('/production')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'}`, onClick: onNavigate, children: "\u041F\u0420\u041E\u0418\u0417\u0412\u041E\u0414\u0421\u0422\u0412\u041E" }) }), _jsx("li", { children: _jsx(Link, { to: "/recipes", className: `block font-medium text-base uppercase ${isActive('/recipes')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'}`, onClick: onNavigate, children: "\u0420\u0415\u0426\u0415\u041F\u0422\u042B" }) }), _jsx("li", { children: _jsx(Link, { to: "/about", className: `block font-medium text-base uppercase ${isActive('/about')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'}`, onClick: onNavigate, children: "\u041E \u041D\u0410\u0421" }) }), _jsx("li", { children: _jsx(Link, { to: "/contacts", className: `block font-medium text-base uppercase ${isActive('/contacts')
                                        ? 'text-blue-800 font-bold'
                                        : 'text-gray-700 hover:text-blue-800'}`, onClick: onNavigate, children: "\u041A\u041E\u041D\u0422\u0410\u041A\u0422\u042B" }) })] }) }), _jsx("div", { className: "mt-8", children: _jsx(Link, { to: "/contacts", className: "block w-full text-center px-4 py-2 border border-blue-800 text-blue-800 font-medium rounded hover:bg-blue-800 hover:text-white transition-colors duration-300", onClick: onNavigate, children: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043D\u0430\u043C\u0438" }) })] }) }));
};
export default DesktopSidebar;
