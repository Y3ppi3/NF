import axios from 'axios';
import { getToken } from './authService.js';

// Create an axios instance with base URL set to the API gateway
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh if needed
apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Here you could add token refresh logic if needed

            return apiClient(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default apiClient;