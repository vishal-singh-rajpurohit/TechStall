'use client';

import { useQuery } from '@tanstack/react-query';
import { Product, ProductsResponse, CategoryInfo, BrandInfo, FilterParams } from '@/types';

async function fetchProducts(filters: FilterParams = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.brand && filters.brand.length > 0) params.set('brand', filters.brand.join(','));
  if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.inStockOnly) params.set('inStockOnly', 'true');
  if (filters.minRating !== undefined) params.set('minRating', filters.minRating.toString());
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());


  const res = await fetch(`/api/products?${params.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await res.json();
  return data;
}

export function useProducts(filters: FilterParams = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async (): Promise<{ product: Product; related: Product[] }> => {
      const res = await fetch(`/api/products/${idOrSlug}`);
      if (!res.ok) {
        throw new Error('Product not found');
      }
      return res.json();
    },
    enabled: !!idOrSlug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryInfo[]> => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async (): Promise<BrandInfo[]> => {
      const res = await fetch('/api/brands');
      if (!res.ok) throw new Error('Failed to fetch brands');
      return res.json();
    },
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async (): Promise<ProductsResponse> => {
      const res = await fetch('/api/products?featured=true&limit=8');
      if (!res.ok) throw new Error('Failed to fetch featured products');
      return res.json();
    },
  });
}

export function useLimitedSaleProducts() {
  return useQuery({
    queryKey: ['products', 'limitedSale'],
    queryFn: async (): Promise<ProductsResponse> => {
      const res = await fetch('/api/products?limitedSale=true&limit=4');
      if (!res.ok) throw new Error('Failed to fetch sale products');
      return res.json();
    },
  });
}
