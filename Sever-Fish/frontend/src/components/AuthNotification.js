import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const AuthNotification = ({ redirectPath = '/cart' }) => {
    const navigate = useNavigate();
    // Сохраняем текущий путь в localStorage для перенаправления после авторизации
    useEffect(() => {
        localStorage.setItem('redirectAfterAuth', redirectPath);
    }, [redirectPath]);
    return (_jsxs("div", { className: "auth-notification-container", children: [_jsxs("div", { className: "auth-notification", children: [_jsx("h2", { children: "\u0414\u043B\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0432\u043E\u0439\u0442\u0438 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442" }), _jsx("p", { children: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0443\u0439\u0442\u0435\u0441\u044C \u0434\u043B\u044F \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0435\u043D\u0438\u044F" }), _jsx("button", { onClick: () => navigate('/auth'), className: "login-button", children: "\u0412\u043E\u0439\u0442\u0438 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442" })] }), _jsx("style", { jsx: true, children: `
        .auth-notification-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 15px;
        }
        
        .auth-notification {
          background-color: #f7fafd;
          border: 1px solid #e0e8f0;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .auth-notification h2 {
          color: #1a3a5c;
          font-size: 22px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .auth-notification p {
          color: #647d98;
          font-size: 16px;
          margin-bottom: 25px;
        }
        
        .login-button {
          background-color: #1a5f7a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .login-button:hover {
          background-color: #124759;
        }
        
        @media (max-width: 600px) {
          .auth-notification {
            padding: 20px;
          }
          
          .auth-notification h2 {
            font-size: 18px;
          }
          
          .auth-notification p {
            font-size: 14px;
          }
          
          .login-button {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      ` })] }));
};
export default AuthNotification;
