'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandInfo } from '@/types';

export function PopularBrands() {
  const [brands, setBrands] = useState<BrandInfo[]>([]);

  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data);
        }
      })
      .catch(() => {});
  }, []);

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Popular Laptop &amp; Hardware Brands
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Shop authentic certified gear from industry-leading manufacturers
            </p>
          </div>
          <Link
            href="/brands"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            See All Brands →
          </Link>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center p-2 mb-2 transition-colors">
                <span className="text-xs font-black text-slate-800 group-hover:text-brand-600 uppercase tracking-tighter">
                  {brand.name.slice(0, 4)}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-brand-600 transition-colors text-center">
                {brand.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {brand.itemCount} {brand.itemCount === 1 ? 'item' : 'items'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
