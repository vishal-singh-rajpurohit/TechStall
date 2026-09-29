import { NextResponse } from 'next/server';
import { mapBackendProduct } from '@/lib/productMapper';
import { Product, ProductsResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Extract query filters
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
  const search = searchParams.get('search')?.toLowerCase().trim();
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const featured = searchParams.get('featured') === 'true';
  const limitedSale = searchParams.get('limitedSale') === 'true';

  let liveProducts: Product[] = [];
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${backendUrl}/api/v1/product/get/products`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        liveProducts = data.map(mapBackendProduct);
      }
    }
  } catch (err) {
    // Backend momentarily unreachable
  }

  let results: Product[] = [...liveProducts];

  // Filter by category
  if (category && category !== 'all') {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by brand (support comma-separated)
  if (brand) {
    const brandsList = brand.split(',').map((b) => b.trim().toLowerCase());
    results = results.filter((p) => brandsList.includes(p.brand.toLowerCase()));
  }

  // Filter by price range
  if (minPrice !== undefined) {
    results = results.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    results = results.filter((p) => p.price <= maxPrice);
  }

  // Filter by stock
  if (inStockOnly) {
    results = results.filter((p) => p.inStock);
  }

  // Filter by rating
  if (minRating !== undefined) {
    results = results.filter((p) => p.rating >= minRating);
  }

  // Filter by search query
  if (search) {
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.shortDescription.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search)
    );
  }

  // Filter by flags
  if (featured) {
    results = results.filter((p) => p.isFeatured);
  }
  if (limitedSale) {
    results = results.filter((p) => p.isLimitedSale || (p.discountPercentage && p.discountPercentage >= 20));
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      results.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
      break;
    case 'popular':
    default:
      results.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
  }

  // Metadata calculations
  const total = results.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedProducts = results.slice(startIndex, startIndex + limit);

  const datasetForMeta = results.length > 0 ? results : liveProducts;
  const availableBrands = Array.from(new Set(datasetForMeta.map((p) => p.brand).filter(Boolean)));
  const prices = datasetForMeta.map((p) => p.price);
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 100000,
  };

  const response: ProductsResponse = {
    products: paginatedProducts,
    total,
    page,
    totalPages,
    availableBrands,
    priceRange,
  };

  return NextResponse.json(response);
}
