import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, addToCart as addToCartAction, updateCartItem as updateCartItemAction, removeFromCart as removeFromCartAction, clearCart as clearCartAction } from '../store/cart/cartSlice';
export const useCart = () => {
    const dispatch = useDispatch();
    const { items, totalItems, totalAmount, loading, error } = useSelector((state) => state.cart);
    const getCart = useCallback(() => {
        dispatch(fetchCart());
    }, [dispatch]);
    const addToCart = useCallback(async (data) => {
        try {
            await dispatch(addToCartAction(data)).unwrap();
            return true;
        }
        catch (error) {
            return false;
        }
    }, [dispatch]);
    const updateCartItem = useCallback(async (productId, data) => {
        try {
            await dispatch(updateCartItemAction({ productId, data })).unwrap();
            return true;
        }
        catch (error) {
            return false;
        }
    }, [dispatch]);
    const removeFromCart = useCallback(async (productId) => {
        try {
            await dispatch(removeFromCartAction(productId)).unwrap();
            return true;
        }
        catch (error) {
            return false;
        }
    }, [dispatch]);
    const clearCart = useCallback(async () => {
        try {
            await dispatch(clearCartAction()).unwrap();
            return true;
        }
        catch (error) {
            return false;
        }
    }, [dispatch]);
    return {
        items,
        totalItems,
        totalAmount,
        loading,
        error,
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
    };
};
