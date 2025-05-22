// Типы для заказов
export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  // Дополнительные данные из связанного товара
  product?: {
    name: string;
    image_url?: string;
  };
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface CreateOrderRequest {
  shipping_address: string;
  contact_phone: string;
}