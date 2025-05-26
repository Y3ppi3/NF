import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/layouts/MainLayout.tsx
import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // функция, которую передадим Header для toggle
    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (_jsxs("div", { className: "flex flex-col h-screen", children: [_jsx(Header, { onToggleSidebar: handleToggleSidebar }), _jsxs("div", { className: "flex flex-1", children: [_jsx(Sidebar, { isOpen: isSidebarOpen }), _jsx("main", { className: `
          flex-1
          bg-gray-50 dark:bg-[#181818]
          p-4
          overflow-auto
          transition-all duration-300
          ${isSidebarOpen ? 'ml-60' : 'ml-16'}
        `, children: _jsx(Outlet, {}) })] })] }));
};
export default MainLayout;
