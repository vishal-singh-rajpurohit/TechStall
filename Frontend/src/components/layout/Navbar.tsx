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
    <nav className="bg-brand-600 text-white relative z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left: All Categories Dropdown Button (Ref 2) */}
          <div className="relative">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center space-x-2 bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-inner"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {categoriesOpen && (
              <div
                onMouseLeave={() => setCategoriesOpen(false)}
                className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-in fade-in"
              >
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-orange-50/80 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {cat.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{cat.count}</div>
                        </div>
                      </div>
                      <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Middle: Primary Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md hover:bg-brand-700/60 transition-colors ${
                pathname === '/' ? 'bg-brand-700 font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/products?category=monitors"
              className="px-3 py-1.5 rounded-md hover:bg-brand-700/60 transition-colors"
            >
              Monitors
            </Link>
            <Link
              href="/products?category=laptops"
              className="px-3 py-1.5 rounded-md hover:bg-brand-700/60 transition-colors"
            >
              Laptops
            </Link>
            <Link
              href="/products?category=ssds"
              className="px-3 py-1.5 rounded-md hover:bg-brand-700/60 transition-colors"
            >
              SSDs & Storage
            </Link>
            <Link
              href="/products?category=accessories"
              className="px-3 py-1.5 rounded-md hover:bg-brand-700/60 transition-colors"
            >
              Accessories
            </Link>
            <Link
              href="/brands"
              className="px-3 py-1.5 rounded-md hover:bg-brand-700/60 transition-colors"
            >
              Brands
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-md hover:bg-brand-700/60 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Right: Promotional Pills (Ref 2: LIMITED SALE, Best Seller, New Arrival) */}
          <div className="flex items-center space-x-2 text-xs">
            <Link
              href="/products?limitedSale=true"
              className="flex items-center space-x-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold rounded-md shadow-sm transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
              <span>LIMITED SALE</span>
            </Link>
            <Link
              href="/products?sort=popular"
              className="hidden lg:flex items-center space-x-1 px-2 py-1 text-white/90 hover:text-white hover:bg-brand-700/50 rounded-md transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Best Seller</span>
            </Link>
            <Link
              href="/products?sort=newest"
              className="hidden lg:flex items-center space-x-1 px-2 py-1 text-white/90 hover:text-white hover:bg-brand-700/50 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Arrival</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
