/**
 * Валидация email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
/**
 * Валидация пароля (минимум 6 символов)
 */
export const isValidPassword = (password) => {
    return password.length >= 6;
};
/**
 * Валидация имени пользователя
 */
export const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};
/**
 * Валидация телефонного номера
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[0-9]{10,12}$/;
    return phoneRegex.test(phone);
};
