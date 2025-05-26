import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsApi } from '../../api/products';
import { Product, Category, ProductFilter, PaginatedResponse } from '../../types/products';

// Асинхронные действия
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ 
    filters, page = 1, limit = 12 
  }: { 
    filters?: ProductFilter; 
    page?: number; 
    limit?: number 
  }, { rejectWithValue }) => {
    try {
      const response = await productsApi.getProducts(filters, page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения товаров');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number, { rejectWithValue }) => {
    try {
      const product = await productsApi.getProductById(id);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения товара');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await productsApi.getCategories();
      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения категорий');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ 
    categoryId, page = 1, limit = 12 
  }: { 
    categoryId: number; 
    page?: number; 
    limit?: number 
  }, { rejectWithValue }) => {
    try {
      const response = await productsApi.getProductsByCategory(categoryId, page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения товаров категории');
    }
  }
);

// Интерфейс состояния товаров
interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  categories: Category[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

// Начальное состояние
const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  categories: [],
  loading: false,
  error: null,
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: 12,
  totalPages: 1,
};

// Создание слайса
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCurrentPage: (state: ProductsState, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearProductsError: (state: ProductsState) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка fetchProducts
    builder.addCase(fetchProducts.pending, (state: ProductsState) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state: ProductsState, action: PayloadAction<PaginatedResponse<Product>>) => {
      state.loading = false;
      state.products = action.payload.items;
      state.totalItems = action.payload.total;
      state.totalPages = action.payload.pages;
      state.currentPage = action.payload.page;
      state.itemsPerPage = action.payload.size;
    });
    builder.addCase(fetchProducts.rejected, (state: ProductsState, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchProductById
    builder.addCase(fetchProductById.pending, (state: ProductsState) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state: ProductsState, action: PayloadAction<Product>) => {
      state.loading = false;
      state.currentProduct = action.payload;
    });
    builder.addCase(fetchProductById.rejected, (state: ProductsState, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchCategories
    builder.addCase(fetchCategories.pending, (state: ProductsState) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state: ProductsState, action: PayloadAction<Category[]>) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state: ProductsState, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchProductsByCategory
    builder.addCase(fetchProductsByCategory.pending, (state: ProductsState) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductsByCategory.fulfilled, (state: ProductsState, action: PayloadAction<PaginatedResponse<Product>>) => {
      state.loading = false;
      state.products = action.payload.items;
      state.totalItems = action.payload.total;
      state.totalPages = action.payload.pages;
      state.currentPage = action.payload.page;
      state.itemsPerPage = action.payload.size;
    });
    builder.addCase(fetchProductsByCategory.rejected, (state: ProductsState, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentPage, clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;