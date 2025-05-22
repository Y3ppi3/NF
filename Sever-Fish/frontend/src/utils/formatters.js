/**
 * Форматирование цены
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
    }).format(price);
};
/**
 * Форматирование даты
 */
export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
/**
 * Преобразование статуса заказа в читаемый вид
 */
export const formatOrderStatus = (status) => {
    const statusMap = {
        pending: 'В обработке',
        processing: 'Выполняется',
        completed: 'Завершен',
        cancelled: 'Отменен',
    };
    return statusMap[status] || status;
};
