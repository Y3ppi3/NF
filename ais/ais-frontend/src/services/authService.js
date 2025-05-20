// Authentication service for saving and retrieving the token

// Save token to localStorage
export const saveToken = (token) => {
    localStorage.setItem('authToken', token);
};

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('authToken');
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Add token to API request headers
export const addTokenToHeaders = (headers = {}) => {
    const token = getToken();
    if (token) {
        return {
            ...headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return headers;
};

// Example axios interceptor setup
export const setupAxiosInterceptors = (axiosInstance) => {
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return axiosInstance;
};