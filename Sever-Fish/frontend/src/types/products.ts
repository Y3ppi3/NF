// Типы для товаров и категорий
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
  is_available: boolean;
  category_id: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ProductFilter {
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}