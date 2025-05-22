// Ключи localStorage
const TOKEN_KEY = 'sever_fish_token';
const USER_ID_KEY = 'sever_fish_user_id';
const USER_NAME_KEY = 'sever_fish_user_name';
const REDIRECT_PATH_KEY = 'sever_fish_redirect_path';

/**
 * Сохранение токена
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Получение токена
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Сохранение ID пользователя
 */
export const setUserId = (id: string): void => {
  localStorage.setItem(USER_ID_KEY, id);
};

/**
 * Получение ID пользователя
 */
export const getUserId = (): string | null => {
  return localStorage.getItem(USER_ID_KEY);
};

/**
 * Сохранение имени пользователя
 */
export const setUsername = (username: string): void => {
  localStorage.setItem(USER_NAME_KEY, username);
};

/**
 * Получение имени пользователя
 */
export const getUsername = (): string | null => {
  return localStorage.getItem(USER_NAME_KEY);
};

/**
 * Сохранение пути для редиректа после авторизации
 */
export const setRedirectPath = (path: string): void => {
  localStorage.setItem(REDIRECT_PATH_KEY, path);
};

/**
 * Получение пути для редиректа после авторизации
 */
export const getRedirectPath = (): string => {
  return localStorage.getItem(REDIRECT_PATH_KEY) || '/';
};

/**
 * Очистка пути для редиректа
 */
export const clearRedirectPath = (): void => {
  localStorage.removeItem(REDIRECT_PATH_KEY);
};

/**
 * Очистка данных авторизации
 */
export const removeAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
};

/**
 * Проверка наличия авторизации
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};