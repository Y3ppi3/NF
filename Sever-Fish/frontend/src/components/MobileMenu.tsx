import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isAuthenticated?: boolean; // Добавлен опциональный параметр
}

const MobileMenu = ({ isOpen, setIsOpen, isAuthenticated = false }: MobileMenuProps) => {
    // Функция закрытия меню
    const handleClose = () => {
        setIsOpen(false);
    };

    // Предотвращаем скролл при открытом меню
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // Добавляем обработчик для клавиши Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    // Получаем имя пользователя для отображения
    const username = localStorage.getItem('username') || '';

    return (
        <>
            {/* Затемнение за меню */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={handleClose}
                    aria-hidden="true"
                ></div>
            )}

            {/* Боковое меню */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-blue-900">МЕНЮ</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={handleClose}
                        aria-label="Закрыть меню"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Блок пользователя (если авторизован) */}
                {isAuthenticated && username && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">{username}</div>
                                <Link 
                                    to="/account" 
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                    onClick={handleClose}
                                >
                                    Личный кабинет
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                <nav className="p-4">
                    <ul className="space-y-4">
                        <li>
                            <Link
                                to="/"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={handleClose}
                            >
                                ГЛАВНАЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/products"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={handleClose}
                            >
                                ПРОДУКЦИЯ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/production"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={handleClose}
                            >
                                ПРОИЗВОДСТВО
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/recipes"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={handleClose}
                            >
                                РЕЦЕПТЫ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={handleClose}
                            >
                                О НАС
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contacts"
                                className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                onClick={handleClose}
                            >
                                КОНТАКТЫ
                            </Link>
                        </li>

                        {/* Добавляем пункты для входа/выхода в зависимости от статуса аутентификации */}
                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link
                                        to="/account"
                                        className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                        onClick={handleClose}
                                    >
                                        ЛИЧНЫЙ КАБИНЕТ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/cart"
                                        className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                        onClick={handleClose}
                                    >
                                        КОРЗИНА
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            // Функция выхода из системы
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('tokenType');
                                            localStorage.removeItem('userId');
                                            localStorage.removeItem('username');
                                            localStorage.removeItem('userEmail');
                                            localStorage.removeItem('userPhone');
                                            localStorage.removeItem('userFullName');
                                            // Перезагружаем страницу для обновления состояния
                                            window.location.href = '/';
                                            handleClose();
                                        }}
                                        className="block text-red-600 hover:text-red-800 font-medium uppercase"
                                    >
                                        ВЫЙТИ
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link
                                    to="/auth"
                                    className="block text-gray-700 hover:text-blue-800 font-medium uppercase"
                                    onClick={handleClose}
                                >
                                    ВОЙТИ / РЕГИСТРАЦИЯ
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>

                <div className="p-4 mt-4">
                    <Link
                        to="/contacts"
                        className="block w-full text-center px-4 py-2 border border-blue-800 text-blue-800 font-medium rounded hover:bg-blue-800 hover:text-white transition-colors"
                        onClick={handleClose}
                    >
                        Связаться с нами
                    </Link>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;