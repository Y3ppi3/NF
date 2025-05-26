import { Product } from './products';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  total_amount: number;
  shipping_address: string;
  contact_phone: string;
  notes?: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  shipping_address: string;
  contact_phone: string;
  notes?: string;
}