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
      <header className="bg-[#0B1F3A] border-b border-[#122B4F] sticky top-0 z-40 transition-all shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Mobile Hamburger + Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-1 text-slate-200 hover:text-white rounded-xl md:hidden hover:bg-[#122B4F] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#FF6B1A] flex items-center justify-center text-white shadow-md shadow-[#FF6B1A]/20 group-hover:scale-105 transition-transform">
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Tech</span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-[#FF6B1A]">Stall</span>
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FF6B1A] ml-0.5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1 hidden xs:block">
                    Computer Hub
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Integrated Modern Search with Category Dropdown (Desktop) */}
            <div ref={searchRef} className="flex-1 max-w-2xl relative hidden md:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center border border-[#E5E7EB] hover:border-[#2563EB] focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/20 rounded-full bg-white transition-all shadow-sm"
              >
                {/* Category Dropdown */}
                <div className="relative border-r border-[#E5E7EB]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-[#1F2937] pl-4 pr-7 py-2.5 focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="all">All Hardware</option>
                    <option value="monitors">Monitors</option>
                    <option value="laptops">Laptops</option>
                    <option value="ssds">SSDs &amp; Storage</option>
                    <option value="accessories">Accessories</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Input Field */}
                <div className="flex-1 flex items-center px-3.5 py-1.5">
                  <Search className="w-4 h-4 text-[#6B7280] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search 4K monitors, laptops, SSDs, keyboards..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#1F2937] placeholder-[#6B7280] focus:outline-none"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="p-1 text-[#6B7280] hover:text-[#1F2937] rounded-full transition-colors mr-1"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>

                {/* Search Submit Button - Vivid Orange CTA */}
                <button
                  type="submit"
                  className="bg-[#FF6B1A] hover:bg-[#E05507] text-white px-5 py-2.5 rounded-full mr-1 transition-colors flex items-center justify-center text-xs font-bold shadow-xs active:scale-95"
                  aria-label="Search"
                >
                  Search
                </button>
              </form>

              {/* Live Search Suggestions Dropdown */}
              {showSuggestions && matchingSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280] px-3.5 flex items-center justify-between">
                    <span>Matching Hardware ({matchingSuggestions.length})</span>
                    <span className="text-[10px] text-[#6B7280] font-normal">Press Enter to search all</span>
                  </div>
                  <div className="divide-y divide-[#E5E7EB] max-h-80 overflow-y-auto">
                    {matchingSuggestions.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center space-x-3.5 p-3 hover:bg-[#EFF6FF] transition-colors group"
                      >
                        <div className="relative w-12 h-12 rounded-xl bg-[#F7F9FC] overflow-hidden shrink-0 border border-[#E5E7EB]">
                          <Image src={item.images?.[0] || FALLBACK_IMAGE} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#1F2937] group-hover:text-[#2563EB] transition-colors truncate">{item.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#6B7280] mt-0.5">
                            <span className="text-[#1F2937] font-semibold">{item.brand}</span>
                            <span>•</span>
                            <span>{item.categoryLabel}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-[#FF6B1A]">{formatPrice(item.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 bg-[#F7F9FC] hover:bg-[#EFF6FF] text-center text-xs font-bold text-[#1F2937] flex items-center justify-center space-x-1.5 transition-colors border-t border-[#E5E7EB]"
                  >
                    <span>View all matching results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Right: User actions (Wishlist, Cart, User Profile) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Wishlist Button */}
              <Link
                href="/products?wishlisted=true"
                className="relative p-2.5 text-slate-200 hover:text-white rounded-xl hover:bg-[#122B4F] transition-colors"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-[#DC2626] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Button with Vivid Orange CTA Pill against Deep Navy */}
              <button
                onClick={openCart}
                className="flex items-center space-x-2.5 px-3.5 py-2 bg-[#FF6B1A] hover:bg-[#E05507] text-white rounded-2xl transition-all group active:scale-[0.98] shadow-md shadow-[#FF6B1A]/25"
                aria-label="Open Shopping Cart"
              >
                <div className="relative text-white">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-[#FF6B1A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#FF6B1A] shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider leading-none">
                    Cart
                  </span>
                  <span className="text-xs font-black text-white mt-0.5">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </button>

              {/* User Authentication Menu (NextAuth) */}
              <div ref={userMenuRef} className="relative">
                {session?.user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-[#122B4F] transition-all border border-transparent hover:border-[#1E3A8A]"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#2563EB]">
                      <Image
                        src={session.user.image || FALLBACK_IMAGE}
                        alt={session.user.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="hidden lg:flex flex-col text-left text-xs">
                      <span className="font-bold text-white leading-tight">
                        {session.user.name}
                      </span>
                      <span className="text-[10px] text-[#16A34A] font-semibold leading-none">
                        Signed In
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300 hidden lg:block" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#122B4F] rounded-xl transition-all border border-[#1E3A8A]/50"
                  >
                    <User className="w-4 h-4 text-slate-300" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}

                {/* Dropdown for Signed In User */}
                {isUserMenuOpen && session?.user && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in zoom-in-95 text-[#1F2937]">
                    <div className="px-4 py-2 border-b border-[#E5E7EB]">
                      <p className="text-xs font-bold text-[#1F2937]">{session.user.name}</p>
                      <p className="text-[11px] text-[#6B7280] truncate">{session.user.email}</p>
                    </div>
                    <div className="py-1 text-xs text-[#1F2937]">
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                      >
                        <Package className="w-4 h-4 mr-2 text-[#6B7280]" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        href="/products?wishlisted=true"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                      >
                        <Heart className="w-4 h-4 mr-2 text-[#6B7280]" />
                        <span>Saved Wishlist ({wishlist.length})</span>
                      </Link>
                    </div>
                    <div className="border-t border-[#E5E7EB] pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ redirect: false });
                        }}
                        className="flex items-center w-full px-4 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] transition-colors font-bold"
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
              className="flex items-center border border-[#E5E7EB] focus-within:border-[#2563EB] rounded-xl bg-white overflow-hidden shadow-xs px-3 py-1.5 transition-all"
            >
              <Search className="w-4 h-4 text-[#6B7280] shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowMobileSuggestions(true);
                }}
                onFocus={() => setShowMobileSuggestions(true)}
                placeholder="Search 4K displays, laptops, SSDs..."
                className="flex-1 bg-transparent text-xs text-[#1F2937] placeholder-[#6B7280] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowMobileSuggestions(false);
                  }}
                  className="text-[#6B7280] hover:text-[#1F2937] text-xs px-1"
                >
                  ✕
                </button>
              ) : null}
              <button
                type="submit"
                className="bg-[#FF6B1A] text-white p-1 rounded-lg ml-1"
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