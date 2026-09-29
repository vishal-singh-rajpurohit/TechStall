'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Monitor,
  Package,
  Layers,
  ArrowRight,
  Menu,
  X,
  Laptop,
  HardDrive,
  Keyboard,
  Flame,
  Phone,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { AuthModal } from '@/components/auth/AuthModal';

// Imports stay exactly as in your current file (React hooks, next/*, lucide-react, useCart, AuthModal, Product type, etc.)

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

// Accepts both a bare array (FastAPI) and { products: [...] } (wrapped Next route)
function extractProducts(data: any): Product[] | null {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.products)) return data.products;
  return null;
}

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { totalItems, subtotal, formatPrice, openCart, wishlist, currency, setCurrency } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowMobileSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Base catalog (used for instant suggestions on short queries)
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  // Server-side search results (null = no server search active)
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/products?limit=50', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const list = extractProducts(data);
        if (list && list.length > 0) setLiveProducts(list);
      })
      .catch(() => { });
    return () => controller.abort();
  }, []);

  // Debounced server search
  useEffect(() => {
    const q = searchQuery.trim();

    if (q.length < 3) {
      setSearchResults(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        console.log("Searching.......")
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(q)}&limit=10`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
        const data = await res.json();
        console.log('Search Result: ', data)
        const list = extractProducts(data);
        setSearchResults(list ?? []);
      } catch (e: any) {
        if (e?.name !== 'AbortError') console.error('Error in searching: ', e);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setShowMobileSuggestions(false);

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    router.push(`/products?${params.toString()}`);
  };

  const query = searchQuery.trim().toLowerCase();

  const matchingSuggestions: Product[] = (() => {
    if (query.length === 0) return [];

    // Server results are already matched to the query, so only apply the category filter.
    // For short queries, filter the base catalog on the client.
    const usingServerResults = searchResults !== null;
    const source = usingServerResults ? searchResults! : liveProducts;

    return source
      .filter((p) => {
        const matchesQuery = usingServerResults
          ? true
          : (p.title?.toLowerCase().includes(query) ||
            p.brand?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query));
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesQuery && matchesCategory;
      })
      .slice(0, 5);
  })();

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
            {/* Mobile Hamburger + Brand Logo */}
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 -ml-1 text-slate-700 hover:text-brand-600 rounded-xl md:hidden transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex items-center space-x-2 shrink-0 group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Tech</span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-600">Stall</span>
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500 ml-0.5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1 hidden xs:block">
                    Computer Hub
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Integrated Search with Category Dropdown (Desktop) */}
            <div ref={searchRef} className="flex-1 max-w-2xl relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="flex items-center border-2 border-slate-200 hover:border-brand-500 focus-within:border-brand-500 rounded-full bg-slate-50/70 overflow-hidden transition-all shadow-sm">
                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-600 pl-4 pr-2 py-2.5 border-r border-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Hardware</option>
                  <option value="monitors">Monitors</option>
                  <option value="laptops">Laptops</option>
                  <option value="ssds">SSDs & Storage</option>
                  <option value="accessories">Accessories</option>
                </select>

                {/* Input Field */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search 4K monitors, gaming laptops, NVMe SSDs..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />

                {/* Search Submit Button */}
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full mr-1 transition-colors flex items-center justify-center"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Live Search Suggestions Dropdown */}
              {showSuggestions && matchingSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-2 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
                    Matching Hardware Products ({matchingSuggestions.length})
                  </div>
                  <div className="divide-y divide-slate-100">
                    {matchingSuggestions.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <Image src={item.images?.[0] || FALLBACK_IMAGE} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                          <span className="text-[10px] font-medium text-slate-400">{item.brand} • {item.categoryLabel}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-brand-600">{formatPrice(item.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-slate-700 flex items-center justify-center space-x-1"
                  >
                    <span>View all matching results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Right: User actions (Wishlist, Cart, User Profile) */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Wishlist Button */}
              <Link
                href="/products?wishlisted=true"
                className="relative p-2 text-slate-700 hover:text-brand-600 rounded-full hover:bg-slate-100 transition-colors"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Button with Price Preview (Ref 2: Cart $150.00) */}
              <button
                onClick={openCart}
                className="flex items-center space-x-2.5 p-2 sm:px-3 sm:py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all group"
                aria-label="Open Shopping Cart"
              >
                <div className="relative text-slate-800 group-hover:text-brand-600 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                    Cart
                  </span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </button>

              {/* User Authentication Menu (NextAuth) */}
              <div ref={userMenuRef} className="relative">
                {session?.user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-brand-500/50">
                      <Image
                        src={session.user.image || FALLBACK_IMAGE}
                        alt={session.user.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="hidden lg:flex flex-col text-left text-xs">
                      <span className="font-bold text-slate-800 leading-tight">
                        {session.user.name}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium leading-none">
                        Signed In
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}

                {/* Dropdown for Signed In User */}
                {isUserMenuOpen && session?.user && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{session.user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{session.user.email}</p>
                    </div>
                    <div className="py-1 text-xs text-slate-700">
                      <Link
                        href="/products"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 mr-2 text-slate-400" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        href="/products?wishlisted=true"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 mr-2 text-slate-400" />
                        <span>Saved Wishlist ({wishlist.length})</span>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ redirect: false });
                        }}
                        className="flex items-center w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Dedicated Search Row */}
          <div ref={mobileSearchRef} className="block md:hidden mt-2.5 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border border-slate-200 focus-within:border-brand-500 rounded-xl bg-slate-50/90 overflow-hidden shadow-xs px-3 py-1.5 transition-all"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowMobileSuggestions(true);
                }}
                onFocus={() => setShowMobileSuggestions(true)}
                placeholder="Search 4K displays, laptops, SSDs..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowMobileSuggestions(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              ) : null}
              <button
                type="submit"
                className="bg-brand-600 text-white p-1 rounded-lg ml-1"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mobile Suggestions Dropdown */}
            {showMobileSuggestions && matchingSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in">
                <div className="p-2 border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 flex justify-between items-center">
                  <span>Suggested Hardware ({matchingSuggestions.length})</span>
                  <button
                    onClick={() => setShowMobileSuggestions(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {matchingSuggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      onClick={() => {
                        setShowMobileSuggestions(false);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center space-x-2.5 p-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        <Image src={item.images?.[0] || FALLBACK_IMAGE} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                        <span className="text-[10px] text-slate-400">{item.brand}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-600 shrink-0">
                        {formatPrice(item.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <span className="font-black text-slate-900 text-lg">TechStall</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hardware Categories */}
              <div className="p-4 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 block">
                  Hardware Categories
                </span>
                <div className="space-y-1">
                  <Link
                    href="/products?category=monitors"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-orange-50 text-xs font-semibold text-slate-800 hover:text-brand-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Monitor className="w-4 h-4 text-brand-600" />
                      <span>4K Displays &amp; Monitors</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                  </Link>

                  <Link
                    href="/products?category=laptops"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-orange-50 text-xs font-semibold text-slate-800 hover:text-brand-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Laptop className="w-4 h-4 text-brand-600" />
                      <span>Laptops &amp; Workstations</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                  </Link>

                  <Link
                    href="/products?category=ssds"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-orange-50 text-xs font-semibold text-slate-800 hover:text-brand-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <HardDrive className="w-4 h-4 text-brand-600" />
                      <span>PCIe Gen5 SSDs &amp; Storage</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                  </Link>

                  <Link
                    href="/products?category=accessories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-orange-50 text-xs font-semibold text-slate-800 hover:text-brand-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Keyboard className="w-4 h-4 text-brand-600" />
                      <span>Keyboards &amp; Accessories</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-4 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 block">
                  Discover
                </span>
                <div className="space-y-1 text-xs font-semibold text-slate-700">
                  <Link
                    href="/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    <Package className="w-4 h-4 text-slate-500" />
                    <span>All Products Catalog</span>
                  </Link>
                  <Link
                    href="/products?limitedSale=true"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-800 font-bold"
                  >
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>Limited Hardware Sale</span>
                  </Link>
                  <Link
                    href="/brands"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Shop by Brands</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    <Package className="w-4 h-4 text-slate-500" />
                    <span>My Orders &amp; Invoices</span>
                  </Link>
                </div>
              </div>

              {/* Currency & Hotline */}
              <div className="p-4 text-xs text-slate-500 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Currency:</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="bg-slate-100 font-bold text-slate-800 rounded-lg px-2.5 py-1 text-xs border-none cursor-pointer"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <span className="text-[11px]">+91 98765 43210 (Hotline)</span>
                </div>
              </div>
            </div>

            {/* Account Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70">
              {session?.user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-brand-500/40">
                      <Image
                        src={session.user.image || FALLBACK_IMAGE}
                        alt={session.user.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{session.user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ redirect: false });
                    }}
                    className="w-full py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-brand-500/20 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}