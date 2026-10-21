'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown, Flame, Sparkles, Award, Monitor, Laptop, HardDrive, Keyboard } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const categories = [
    { name: 'Monitors & Displays', href: '/products?category=monitors', icon: Monitor, count: '8 Models' },
    { name: 'Laptops & Workstations', href: '/products?category=laptops', icon: Laptop, count: '6 Models' },
    { name: 'SSDs & Storage (SST)', href: '/products?category=ssds', icon: HardDrive, count: '6 Models' },
    { name: 'Computer Accessories', href: '/products?category=accessories', icon: Keyboard, count: '8 Models' },
  ];

  return (
    <nav className="bg-[#0B1F3A] border-b border-[#122B4F] text-slate-200 relative z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left: All Categories Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center space-x-2 bg-[#122B4F] hover:bg-[#1A3D6C] text-white border border-[#1E3A8A] px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <Menu className="w-3.5 h-3.5 text-[#FF6B1A]" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Clean White Surface */}
            {categoriesOpen && (
              <div
                onMouseLeave={() => setCategoriesOpen(false)}
                className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-2 z-50 text-[#1F2937] animate-in fade-in zoom-in-95"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB] mb-1">
                  Product Categories
                </div>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EFF6FF] transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#F7F9FC] text-[#1F2937] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1F2937] group-hover:text-[#2563EB] transition-colors">
                            {cat.name}
                          </div>
                          <div className="text-[10px] text-[#6B7280]">{cat.count}</div>
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#2563EB] -rotate-90 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Middle: Primary Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-xs font-semibold">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/'
                  ? 'bg-[#122B4F] text-[#2563EB] font-bold border border-[#2563EB]/40'
                  : 'text-slate-300 hover:text-white hover:bg-[#122B4F]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products?category=monitors"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#122B4F] transition-all"
            >
              4K Monitors
            </Link>
            <Link
              href="/products?category=laptops"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#122B4F] transition-all"
            >
              Laptops
            </Link>
            <Link
              href="/products?category=ssds"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#122B4F] transition-all"
            >
              SSDs &amp; Storage
            </Link>
            <Link
              href="/products?category=accessories"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#122B4F] transition-all"
            >
              Accessories
            </Link>
            <Link
              href="/brands"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#122B4F] transition-all"
            >
              Top Brands
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#122B4F] transition-all"
            >
              About
            </Link>
            <Link
              href="/orders"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#122B4F] transition-all"
            >
              Track Order
            </Link>
          </div>

          {/* Right: Promotional Pills */}
          <div className="flex items-center space-x-2 text-xs">
            <Link
              href="/products?limitedSale=true"
              className="flex items-center space-x-1.5 px-3 py-1 bg-[#FF6B1A] hover:bg-[#E05507] text-white font-extrabold rounded-full shadow-xs transition-all active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>LIMITED SALE</span>
            </Link>
            <Link
              href="/products?sort=popular"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-[#122B4F] rounded-full transition-colors font-medium text-xs"
            >
              <Award className="w-3.5 h-3.5 text-[#FF6B1A]" />
              <span>Best Sellers</span>
            </Link>
            <Link
              href="/products?sort=newest"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-[#122B4F] rounded-full transition-colors font-medium text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>New Arrivals</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
