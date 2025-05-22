// Типы для корзины
export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  user_id: number;
  // Дополнительные данные из связанного товара
  product?: {
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartSummary {
  total_items: number;
  total_amount: number;
  items: CartItem[];
}