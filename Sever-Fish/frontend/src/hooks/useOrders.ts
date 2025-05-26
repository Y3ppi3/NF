import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchOrders, 
  fetchOrderById, 
  createOrder as createOrderAction,
  cancelOrder as cancelOrderAction
} from '../store/orders/ordersSlice';
import { CreateOrderRequest } from '../types/orders';
import { clearCart } from '../store/cart/cartSlice';
import { useNavigate } from 'react-router-dom';

export const useOrders = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, currentOrder, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  const getOrders = useCallback(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getOrderById = useCallback(
    (id: number) => {
      dispatch(fetchOrderById(id));
    },
    [dispatch]
  );

  const createOrder = useCallback(
    async (data: CreateOrderRequest) => {
      try {
        const order = await dispatch(createOrderAction(data)).unwrap();
        // Очищаем корзину после успешного создания заказа
        await dispatch(clearCart());
        // Перенаправляем на страницу успешного оформления заказа
        navigate(`/orders/${order.id}/success`);
        return true;
      } catch (error) {
        return false;
      }
    },
    [dispatch, navigate]
  );

  const cancelOrder = useCallback(
    async (id: number) => {
      try {
        await dispatch(cancelOrderAction(id)).unwrap();
        return true;
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  return {
    orders,
    currentOrder,
    loading,
    error,
    getOrders,
    getOrderById,
    createOrder,
    cancelOrder,
  };
};