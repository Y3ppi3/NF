import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi } from '../../api/orders';
import { Order, CreateOrderRequest } from '../../types/orders';

// Асинхронные действия
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const orders = await ordersApi.getOrders();
      return orders;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения заказов');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: number, { rejectWithValue }) => {
    try {
      const order = await ordersApi.getOrderById(id);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения заказа');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (data: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const order = await ordersApi.createOrder(data);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка создания заказа');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await ordersApi.cancelOrder(id);
      // После отмены заказа обновляем список заказов
      dispatch(fetchOrders());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка отмены заказа');
    }
  }
);

// Интерфейс состояния заказов
interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

// Создание слайса
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка fetchOrders
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchOrderById
    builder.addCase(fetchOrderById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
      state.loading = false;
      state.currentOrder = action.payload;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка createOrder
    builder.addCase(createOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
      state.loading = false;
      state.orders = [...state.orders, action.payload];
      state.currentOrder = action.payload;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка cancelOrder
    builder.addCase(cancelOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelOrder.fulfilled, (state) => {
      state.loading = false;
      // Обновление списка заказов происходит через fetchOrders в thunk
    });
    builder.addCase(cancelOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;