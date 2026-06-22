export interface Category {
  id: number;
  slug: string;
  title: string;
  image: string;
  productCount?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  title: string;
  type: 'checkbox' | 'range';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface CategoryFilters {
  priceMin: number;
  priceMax: number;
  groups: FilterGroup[];
}

export interface Product {
  id: number;
  slug: string;
  categorySlug: string;
  image: string;
  title: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  status?: 'instock' | 'outofstock';
  article?: string;
  badge?: string;
  description?: string;
  brand?: string;
  filterMeta?: Record<string, string | string[]>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}