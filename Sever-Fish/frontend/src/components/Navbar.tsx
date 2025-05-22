import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, logout, getCurrentUser } from '../services/auth';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    } else {
      setUser(null);
    }
  }, []);
  
  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };
  
  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Север-Рыба</span>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link 
                to="/products" 
                className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Каталог
              </Link>
              
              {isAuthenticated() && (
                <Link 
                  to="/orders" 
                  className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Мои заказы
                </Link>
              )}
              
              {isAuthenticated() && isAdmin() && (
                <Link 
                  to="/admin" 
                  className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Админ-панель
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center">
            {isAuthenticated() ? (
              <div className="hidden md:flex items-center">
                <Link 
                  to="/cart" 
                  className="relative text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Корзина
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                
                <div className="relative ml-4 group">
                  <button 
                    className="flex items-center text-sm font-medium text-white hover:bg-blue-700 px-3 py-2 rounded-md"
                  >
                    <span>{user?.username || 'Пользователь'}</span>
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Мой профиль
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Мои заказы
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                <Link 
                  to="/auth" 
                  className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Войти
                </Link>
              </div>
            )}
            
            <div className="flex items-center md:hidden">
              {isAuthenticated() && (
                <Link 
                  to="/cart" 
                  className="relative text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              >
                <svg 
                  className={`h-6 w-6 ${isMobileMenuOpen ? 'hidden' : 'block'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`h-6 w-6 ${isMobileMenuOpen ? 'block' : 'hidden'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Мобильное меню */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            to="/products" 
            className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Каталог
          </Link>
          
          {isAuthenticated() && (
            <>
              <Link 
                to="/orders" 
                className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Мои заказы
              </Link>
              
              {isAdmin() && (
                <Link 
                  to="/admin" 
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Админ-панель
                </Link>
              )}
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Выйти ({user?.username || 'Пользователь'})
              </button>
            </>
          )}
          
          {!isAuthenticated() && (
            <Link 
              to="/auth" 
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;