import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartApi } from '../../api/cart';
import { CartItem, CartSummary, AddToCartRequest, UpdateCartItemRequest } from '../../types/cart';

// Асинхронные действия
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения корзины');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: AddToCartRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartApi.addToCart(data);
      // После добавления товара в корзину, обновляем всю корзину
      dispatch(fetchCart());
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка добавления товара в корзину');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ 
    productId, 
    data 
  }: { 
    productId: number; 
    data: UpdateCartItemRequest 
  }, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartApi.updateCartItem(productId, data);
      // После обновления элемента корзины, обновляем всю корзину
      dispatch(fetchCart());
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка обновления товара в корзине');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: number, { rejectWithValue, dispatch }) => {
    try {
      await cartApi.removeFromCart(productId);
      // После удаления товара из корзины, обновляем всю корзину
      dispatch(fetchCart());
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка удаления товара из корзины');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clearCart();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка очистки корзины');
    }
  }
);

// Интерфейс состояния корзины
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
  error: null,
};

// Создание слайса
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка fetchCart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartSummary>) => {
      state.loading = false;
      state.items = action.payload.items;
      state.totalItems = action.payload.total_items;
      state.totalAmount = action.payload.total_amount;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка addToCart
    builder.addCase(addToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addToCart.fulfilled, (state) => {
      state.loading = false;
      // Обновление корзины происходит через fetchCart в thunk
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка updateCartItem
    builder.addCase(updateCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCartItem.fulfilled, (state) => {
      state.loading = false;
      // Обновление корзины происходит через fetchCart в thunk
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка removeFromCart
    builder.addCase(removeFromCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeFromCart.fulfilled, (state) => {
      state.loading = false;
      // Обновление корзины происходит через fetchCart в thunk
    });
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка clearCart
    builder.addCase(clearCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCart.fulfilled, (state) => {
      state.loading = false;
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    });
    builder.addCase(clearCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;