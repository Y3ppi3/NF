import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsApi } from '../../api/products';
// Асинхронные действия
export const fetchProducts = createAsyncThunk('products/fetchProducts', async ({ filters, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
        const response = await productsApi.getProducts(filters, page, limit);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.message || 'Ошибка получения товаров');
    }
});
export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue }) => {
    try {
        const product = await productsApi.getProductById(id);
        return product;
    }
    catch (error) {
        return rejectWithValue(error.message || 'Ошибка получения товара');
    }
});
export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const categories = await productsApi.getCategories();
        return categories;
    }
    catch (error) {
        return rejectWithValue(error.message || 'Ошибка получения категорий');
    }
});
export const fetchProductsByCategory = createAsyncThunk('products/fetchProductsByCategory', async ({ categoryId, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
        const response = await productsApi.getProductsByCategory(categoryId, page, limit);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.message || 'Ошибка получения товаров категории');
    }
});
// Начальное состояние
const initialState = {
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
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        clearProductsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Обработка fetchProducts
        builder.addCase(fetchProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload.items;
            state.totalItems = action.payload.total;
            state.totalPages = action.payload.pages;
            state.currentPage = action.payload.page;
            state.itemsPerPage = action.payload.size;
        });
        builder.addCase(fetchProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Обработка fetchProductById
        builder.addCase(fetchProductById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchProductById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentProduct = action.payload;
        });
        builder.addCase(fetchProductById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Обработка fetchCategories
        builder.addCase(fetchCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.categories = action.payload;
        });
        builder.addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Обработка fetchProductsByCategory
        builder.addCase(fetchProductsByCategory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchProductsByCategory.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload.items;
            state.totalItems = action.payload.total;
            state.totalPages = action.payload.pages;
            state.currentPage = action.payload.page;
            state.itemsPerPage = action.payload.size;
        });
        builder.addCase(fetchProductsByCategory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { setCurrentPage, clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
