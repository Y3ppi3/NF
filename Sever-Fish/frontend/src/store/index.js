import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import productsReducer from './products/productsSlice';
import cartReducer from './cart/cartSlice';
import ordersReducer from './orders/ordersSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productsReducer,
        cart: cartReducer,
        orders: ordersReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});
