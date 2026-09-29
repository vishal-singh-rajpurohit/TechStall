'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, SlidersHorizontal, ArrowUpDown, Check, RefreshCw } from 'lucide-react';
import { useProducts, useBrands } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { Product, FilterParams } from '@/types';
import { useCart } from '@/context/CartContext';

export function ProductCatalogView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist } = useCart();

  const [category, setCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? searchParams.get('brand')!.split(',') : []
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get('inStockOnly') === 'true');
  const [sort, setSort] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const isWishlistOnly = searchParams.get('wishlisted') === 'true';
  const searchQuery = searchParams.get('q') || '';

  // Sync category when URL searchParams change
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) setCategory(urlCat);
    const urlBrand = searchParams.get('brand');
    if (urlBrand) setSelectedBrands(urlBrand.split(','));
  }, [searchParams]);

  const { data: brandsData } = useBrands();

  // Query products with TanStack Query
  const filters: FilterParams = {
    category: category !== 'all' ? category : undefined,
    brand: selectedBrands.length > 0 ? selectedBrands : undefined,
    minPrice,
    maxPrice,
    inStockOnly: inStockOnly ? true : undefined,
    search: searchQuery || undefined,
    sort,
    limit: 24,
  };

  const { data, isLoading, refetch } = useProducts(filters);

  // If user requested wishlisted items, filter locally by wishlist IDs
  let displayedProducts = data?.products || [];
  if (isWishlistOnly) {
    displayedProducts = displayedProducts.filter((p) => wishlist.includes(p.id));
  }

  const toggleBrand = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const clearAllFilters = () => {
    setCategory('all');
    setSelectedBrands([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setSort('popular');
    router.push('/products');
  };

  const categories = [
    { id: 'all', label: 'All Hardware' },
    { id: 'monitors', label: 'Monitors & Displays' },
    { id: 'laptops', label: 'Laptops & Workstations' },
    { id: 'ssds', label: 'SSDs & Storage (SST)' },
    { id: 'accessories', label: 'Computer Accessories' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200/80 mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isWishlistOnly
                ? 'Your Saved Wishlist'
                : searchQuery
                ? `Search results for "${searchQuery}"`
                : category !== 'all'
                ? categories.find((c) => c.id === category)?.label
                : 'Computer Accessories Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {displayedProducts.length} verified products
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
            >
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </button>

            {/* Sorting */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-extrabold text-slate-900">Filter Hardware</span>
                </div>
                {(category !== 'all' || selectedBrands.length > 0 || minPrice || maxPrice || inStockOnly) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-brand-600 hover:text-brand-700 font-bold"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        category === cat.id
                          ? 'bg-orange-50 text-brand-600 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {category === cat.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Manufacturer
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {brandsData?.map((brand) => {
                    const isChecked = selectedBrands.includes(brand.name);
                    return (
                      <label
                        key={brand.id}
                        className="flex items-center space-x-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 rounded-md cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-slate-900' : 'font-medium'}>
                          {brand.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Price Range (₹)
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice !== undefined ? minPrice : ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice !== undefined ? maxPrice : ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span className="font-semibold">In Stock Items Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 Columns on Large screens, 2 Columns on Mobile) */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl h-72 sm:h-80 p-3 sm:p-4 border border-slate-200">
                    <div className="bg-slate-100 aspect-square rounded-xl mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-600 flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No hardware found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not find any accessories matching your current filter selections. Try clearing your filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Mobile Drawer Filter */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <span className="font-extrabold text-slate-900 text-sm">Filter Hardware</span>
                </div>
                <div className="flex items-center space-x-2">
                  {(category !== 'all' || selectedBrands.length > 0 || minPrice || maxPrice || inStockOnly) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-brand-600 font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile categories */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Category</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        category === cat.id ? 'bg-orange-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {category === cat.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Brands Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Manufacturer</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {brandsData?.map((brand) => {
                    const isChecked = selectedBrands.includes(brand.name);
                    return (
                      <label
                        key={brand.id}
                        className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                        />
                        <span className={isChecked ? 'font-bold text-slate-900' : 'font-medium'}>
                          {brand.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Price Range */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Price Range (₹)</h4>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice !== undefined ? minPrice : ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice !== undefined ? maxPrice : ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile In Stock Only */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span className="font-semibold">In Stock Items Only</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full mt-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              Apply Filters ({displayedProducts.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
