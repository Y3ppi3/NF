import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('cookieConsent');
        if (!hasAccepted) {
            setIsVisible(true);
        }
    }, []);
    const handleAccept = () => {
        // Save the consent in localStorage
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };
    if (!isVisible)
        return null;
    return (_jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-50", children: _jsxs("div", { className: "container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between", children: [_jsx("p", { className: "mb-4 sm:mb-0", children: "\u042D\u0442\u043E\u0442 \u0441\u0430\u0439\u0442 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u0444\u0430\u0439\u043B\u044B cookie \u0434\u043B\u044F \u043E\u0431\u0435\u0441\u043F\u0435\u0447\u0435\u043D\u0438\u044F \u043D\u0430\u0438\u043B\u0443\u0447\u0448\u0435\u0433\u043E \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F." }), _jsx("button", { className: "bg-white text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors", onClick: handleAccept, children: "\u042F \u0421\u041E\u0413\u041B\u0410\u0421\u0415\u041D" })] }) }));
};
export default CookieConsent;
