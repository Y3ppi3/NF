import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';
const CartContext = createContext(undefined);
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Получаем токен аутентификации
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('tokenType');
        if (!token || !tokenType) {
            return null;
        }
        return {
            Authorization: `${tokenType} ${token}`
        };
    };
    // Загружаем корзину при инициализации
    useEffect(() => {
        fetchCart();
    }, []);
    const fetchCart = async () => {
        const headers = getAuthHeaders();
        // Если пользователь не авторизован, не загружаем корзину
        if (!headers) {
            setCartItems([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(API_ENDPOINTS.CART, { headers });
            setCartItems(res.data);
        }
        catch (err) {
            console.error('Ошибка при загрузке корзины:', err);
            setError('Не удалось загрузить корзину');
            // Если ошибка авторизации, очищаем корзину
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setCartItems([]);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const addToCart = async (productId, quantity = 1) => {
        const headers = getAuthHeaders();
        if (!headers) {
            setError('Для добавления товаров в корзину необходимо авторизоваться');
            return false;
        }
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(API_ENDPOINTS.CART, { product_id: productId, quantity }, { headers });
            // Обновляем корзину после добавления
            await fetchCart();
            return true;
        }
        catch (err) {
            console.error('Ошибка при добавлении товара в корзину:', err);
            setError('Не удалось добавить товар в корзину');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    const updateCartItem = async (cartItemId, quantity) => {
        const headers = getAuthHeaders();
        if (!headers) {
            setError('Для изменения корзины необходимо авторизоваться');
            return false;
        }
        setIsLoading(true);
        setError(null);
        try {
            await axios.patch(API_ENDPOINTS.CART_ITEM(cartItemId), { quantity }, { headers });
            // Обновляем корзину после изменения
            await fetchCart();
            return true;
        }
        catch (err) {
            console.error('Ошибка при изменении количества товара:', err);
            setError('Не удалось изменить количество товара');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    const removeFromCart = async (cartItemId) => {
        const headers = getAuthHeaders();
        if (!headers) {
            setError('Для удаления товаров из корзины необходимо авторизоваться');
            return false;
        }
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(API_ENDPOINTS.CART_ITEM(cartItemId), { headers });
            // Обновляем корзину после удаления
            await fetchCart();
            return true;
        }
        catch (err) {
            console.error('Ошибка при удалении товара из корзины:', err);
            setError('Не удалось удалить товар из корзины');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    const clearCart = async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            setError('Для очистки корзины необходимо авторизоваться');
            return false;
        }
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(API_ENDPOINTS.CART, { headers });
            setCartItems([]);
            return true;
        }
        catch (err) {
            console.error('Ошибка при очистке корзины:', err);
            setError('Не удалось очистить корзину');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    // Вычисляем общее количество товаров в корзине
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return (_jsx(CartContext.Provider, { value: {
            cartItems,
            cartCount,
            isLoading,
            error,
            addToCart,
            updateCartItem,
            removeFromCart,
            clearCart,
        }, children: children }));
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
