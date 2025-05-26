import { Product } from './products';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}