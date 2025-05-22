import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';
import { getToken, getUserId, setToken, setUserId, setUsername, removeAuthData } from '../../utils/storage';
import { LoginRequest, RegisterRequest, UserData, AuthResponse } from '../../types/api';

// Асинхронные действия
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка входа');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка регистрации');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      if (!getToken()) return null;
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения данных пользователя');
    }
  }
);

// Интерфейс состояния авторизации
interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: AuthState = {
  user: null,
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
};

// Создание слайса
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      removeAuthData();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      
      // Сохраняем данные в localStorage
      setToken(action.payload.access_token);
      setUserId(action.payload.user.id.toString());
      setUsername(action.payload.user.username);
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      
      // Сохраняем данные в localStorage
      setToken(action.payload.access_token);
      setUserId(action.payload.user.id.toString());
      setUsername(action.payload.user.username);
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchCurrentUser
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserData | null>) => {
      state.loading = false;
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload as string;
      removeAuthData();
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;