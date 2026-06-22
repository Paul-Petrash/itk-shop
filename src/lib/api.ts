import type { Category, CategoryFilters, Product, Cart } from './types';
import { mockCategories, mockFilters, mockProducts, mockCart } from './mock';

const API_URL = import.meta.env.PUBLIC_API_URL;

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  if (API_URL === 'mock') return mockCategories;
  return fetchJson<Category[]>('/categories');
}

export async function getCategory(slug: string): Promise<Category | null> {
  if (API_URL === 'mock') return mockCategories.find(c => c.slug === slug) ?? null;
  const res = await fetch(`${API_URL}/categories/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API /categories/${slug} → ${res.status}`);
  return res.json() as Promise<Category>;
}

export async function getProducts(): Promise<Product[]> {
  if (API_URL === 'mock') return mockProducts;
  return fetchJson<Product[]>('/products');
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (API_URL === 'mock') return mockProducts.filter(p => p.categorySlug === categorySlug);
  return fetchJson<Product[]>(`/categories/${categorySlug}/products`);
}

export async function getProduct(categorySlug: string, slug: string): Promise<Product | null> {
  if (API_URL === 'mock') {
    return mockProducts.find(p => p.categorySlug === categorySlug && p.slug === slug) ?? null;
  }
  const res = await fetch(`${API_URL}/categories/${categorySlug}/products/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API /categories/${categorySlug}/products/${slug} → ${res.status}`);
  return res.json() as Promise<Product>;
}

export async function getFilters(categorySlug: string): Promise<CategoryFilters | null> {
  if (API_URL === 'mock') return mockFilters[categorySlug] ?? null;
  const res = await fetch(`${API_URL}/categories/${categorySlug}/filters`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API /categories/${categorySlug}/filters → ${res.status}`);
  return res.json() as Promise<CategoryFilters>;
}

export async function getCart(): Promise<Cart> {
  if (API_URL === 'mock') return mockCart;
  return fetchJson<Cart>('/cart', { credentials: 'include' });
}