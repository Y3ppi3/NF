import apiClient from './client';
export const authApi = {
    /**
     * Вход пользователя
     */
    login: async (credentials) => {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        const response = await apiClient.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },
    /**
     * Регистрация нового пользователя
     */
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },
    /**
     * Получение данных текущего пользователя
     */
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
    /**
     * Обновление данных пользователя
     */
    updateUserProfile: async (data) => {
        const response = await apiClient.put('/auth/me', data);
        return response.data;
    },
};
