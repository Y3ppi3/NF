export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_available: boolean;
  category_id: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilter {
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}