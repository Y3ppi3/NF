// Ключи localStorage
const TOKEN_KEY = 'sever_fish_token';
const USER_ID_KEY = 'sever_fish_user_id';
const USER_NAME_KEY = 'sever_fish_user_name';
const REDIRECT_PATH_KEY = 'sever_fish_redirect_path';
/**
 * Сохранение токена
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};
/**
 * Получение токена
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};
/**
 * Сохранение ID пользователя
 */
export const setUserId = (id) => {
    localStorage.setItem(USER_ID_KEY, id);
};
/**
 * Получение ID пользователя
 */
export const getUserId = () => {
    return localStorage.getItem(USER_ID_KEY);
};
/**
 * Сохранение имени пользователя
 */
export const setUsername = (username) => {
    localStorage.setItem(USER_NAME_KEY, username);
};
/**
 * Получение имени пользователя
 */
export const getUsername = () => {
    return localStorage.getItem(USER_NAME_KEY);
};
/**
 * Сохранение пути для редиректа после авторизации
 */
export const setRedirectPath = (path) => {
    localStorage.setItem(REDIRECT_PATH_KEY, path);
};
/**
 * Получение пути для редиректа после авторизации
 */
export const getRedirectPath = () => {
    return localStorage.getItem(REDIRECT_PATH_KEY) || '/';
};
/**
 * Очистка пути для редиректа
 */
export const clearRedirectPath = () => {
    localStorage.removeItem(REDIRECT_PATH_KEY);
};
/**
 * Очистка данных авторизации
 */
export const removeAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
};
/**
 * Проверка наличия авторизации
 */
export const isAuthenticated = () => {
    return !!getToken();
};
