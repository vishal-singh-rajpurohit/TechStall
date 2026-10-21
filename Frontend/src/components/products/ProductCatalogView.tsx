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
    <div className="bg-[#F7F9FC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E5E7EB] mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight">
              {isWishlistOnly
                ? 'Your Saved Wishlist'
                : searchQuery
                ? `Search results for "${searchQuery}"`
                : category !== 'all'
                ? categories.find((c) => c.id === category)?.label
                : 'Computer Accessories Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              Showing {displayedProducts.length} verified products
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1F2937] shadow-sm hover:border-[#2563EB]"
            >
              <Filter className="w-4 h-4 text-[#2563EB]" />
              <span>Filters</span>
            </button>

            {/* Sorting */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-[#E5E7EB] shadow-sm text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="font-semibold text-[#6B7280]">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-transparent font-bold text-[#1F2937] focus:outline-none cursor-pointer"
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
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-sm font-extrabold text-[#1F2937]">Filter Hardware</span>
                </div>
                {(category !== 'all' || selectedBrands.length > 0 || minPrice || maxPrice || inStockOnly) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-[#FF6B1A] hover:text-[#E05507] font-bold"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        category === cat.id
                          ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#BFDBFE]'
                          : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F7F9FC]'
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
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-3">
                  Manufacturer
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {brandsData?.map((brand) => {
                    const isChecked = selectedBrands.includes(brand.name);
                    return (
                      <label
                        key={brand.id}
                        className="flex items-center space-x-2.5 text-xs text-[#1F2937] hover:text-[#2563EB] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#E5E7EB] rounded-md cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#1F2937]' : 'font-medium text-[#6B7280]'}>
                          {brand.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter with Quick Presets */}
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-3">
                  Price Range (₹)
                </h4>
                {/* Price Presets */}
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  <button
                    onClick={() => {
                      setMinPrice(undefined);
                      setMaxPrice(5000);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      minPrice === undefined && maxPrice === 5000
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                    }`}
                  >
                    &lt; ₹5,000
                  </button>
                  <button
                    onClick={() => {
                      setMinPrice(5000);
                      setMaxPrice(20000);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      minPrice === 5000 && maxPrice === 20000
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                    }`}
                  >
                    ₹5K - ₹20K
                  </button>
                  <button
                    onClick={() => {
                      setMinPrice(20000);
                      setMaxPrice(50000);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      minPrice === 20000 && maxPrice === 50000
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                    }`}
                  >
                    ₹20K - ₹50K
                  </button>
                  <button
                    onClick={() => {
                      setMinPrice(50000);
                      setMaxPrice(undefined);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      minPrice === 50000 && maxPrice === undefined
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                    }`}
                  >
                    &gt; ₹50,000
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice !== undefined ? minPrice : ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-semibold text-[#1F2937]"
                  />
                  <span className="text-[#6B7280] font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice !== undefined ? maxPrice : ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-semibold text-[#1F2937]"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <label className="flex items-center space-x-2.5 text-xs text-[#1F2937] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A] border-[#E5E7EB]"
                  />
                  <span className="font-semibold">In Stock Items Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 Columns on Large screens, 2 Columns on Mobile) */}
          <main className="lg:col-span-3 space-y-4">
            {/* Active Filter Chips Strip */}
            {(category !== 'all' || selectedBrands.length > 0 || minPrice !== undefined || maxPrice !== undefined || inStockOnly) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mr-1">Active:</span>

                {category !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-full text-xs font-bold">
                    <span>{categories.find((c) => c.id === category)?.label || category}</span>
                    <button onClick={() => setCategory('all')} className="hover:text-[#1D4ED8]" title="Remove category filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBrands.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7F9FC] text-[#1F2937] border border-[#E5E7EB] rounded-full text-xs font-semibold">
                    <span>{b}</span>
                    <button onClick={() => toggleBrand(b)} className="hover:text-[#2563EB]" title={`Remove ${b} filter`}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7F9FC] text-[#1F2937] border border-[#E5E7EB] rounded-full text-xs font-semibold">
                    <span>
                      ₹{minPrice !== undefined ? minPrice.toLocaleString('en-IN') : '0'} - {maxPrice !== undefined ? `₹${maxPrice.toLocaleString('en-IN')}` : 'Any'}
                    </span>
                    <button
                      onClick={() => {
                        setMinPrice(undefined);
                        setMaxPrice(undefined);
                      }}
                      className="hover:text-[#2563EB]"
                      title="Remove price filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] rounded-full text-xs font-bold">
                    <span>In Stock Only</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:text-[#15803D]" title="Remove in-stock filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-[#FF6B1A] hover:text-[#E05507] ml-auto hover:underline"
                >
                  Clear All
                </button>
              </div>
            )}
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
                        category === cat.id ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#BFDBFE]' : 'text-[#6B7280] hover:bg-[#F7F9FC]'
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
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-2">Manufacturer</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {brandsData?.map((brand) => {
                    const isChecked = selectedBrands.includes(brand.name);
                    return (
                      <label
                        key={brand.id}
                        className="flex items-center space-x-2 text-xs text-[#1F2937] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#E5E7EB]"
                        />
                        <span className={isChecked ? 'font-bold text-[#1F2937]' : 'font-medium text-[#6B7280]'}>
                          {brand.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Price Range */}
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-2">Price Range (₹)</h4>
                {/* Mobile Quick Presets */}
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  <button
                    onClick={() => {
                      setMinPrice(undefined);
                      setMaxPrice(5000);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      minPrice === undefined && maxPrice === 5000
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    &lt; ₹5,000
                  </button>
                  <button
                    onClick={() => {
                      setMinPrice(5000);
                      setMaxPrice(20000);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      minPrice === 5000 && maxPrice === 20000
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    ₹5K - ₹20K
                  </button>
                  <button
                    onClick={() => {
                      setMinPrice(20000);
                      setMaxPrice(50000);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      minPrice === 20000 && maxPrice === 50000
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    ₹20K - ₹50K
                  </button>
                  <button
                    onClick={() => {
                      setMinPrice(50000);
                      setMaxPrice(undefined);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      minPrice === 50000 && maxPrice === undefined
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    &gt; ₹50,000
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice !== undefined ? minPrice : ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#1F2937]"
                  />
                  <span className="text-[#6B7280]">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice !== undefined ? maxPrice : ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#1F2937]"
                  />
                </div>
              </div>

              {/* Mobile In Stock Only */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <label className="flex items-center space-x-2 text-xs text-[#1F2937] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A] border-[#E5E7EB]"
                  />
                  <span className="font-semibold">In Stock Items Only</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full mt-6 py-3 bg-[#FF6B1A] hover:bg-[#E05507] text-white font-bold rounded-xl text-xs shadow-md transition-colors active:scale-95"
            >
              Apply Filters ({displayedProducts.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
