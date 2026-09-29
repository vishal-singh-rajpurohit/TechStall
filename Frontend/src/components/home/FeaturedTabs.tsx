'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, PackageOpen } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { Product } from '@/types';

export function FeaturedTabs() {
  const [activeTab, setActiveTab] = useState<'all' | 'monitors' | 'laptops' | 'ssds' | 'accessories'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({
    category: activeTab === 'all' ? undefined : activeTab,
    limit: 8,
  });

  const tabs = [
    { id: 'all', label: 'All Products' },
    { id: 'monitors', label: '4K Monitors' },
    { id: 'laptops', label: 'Laptops' },
    { id: 'ssds', label: 'SSDs & Storage (SST)' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-brand-600" />
              <span>Editor&apos;s Pick Hardware</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Computer Accessories
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-72 sm:h-80 p-3 sm:p-4 flex flex-col justify-between">
                <div className="bg-slate-200 aspect-square rounded-xl mb-3 shimmer-effect" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 shimmer-effect" />
                <div className="h-4 bg-slate-200 rounded w-1/2 shimmer-effect" />
              </div>
            ))}
          </div>
        ) : data?.products && data.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {data.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200/60 flex flex-col items-center justify-center space-y-3">
            <PackageOpen className="w-10 h-10 text-slate-300" />
            <p className="text-slate-500 font-medium text-sm">
              No products found in {currentTab?.label || 'this category'} currently.
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 underline"
              >
                View all available products
              </button>
            )}
          </div>
        )}

        {/* View All Footer CTA */}
        <div className="text-center mt-10">
          <Link
            href={activeTab === 'all' ? '/products' : `/products?category=${activeTab}`}
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors shadow-md group"
          >
            <span>
              {activeTab === 'all'
                ? 'Explore Full Hardware Catalog'
                : `Explore All ${currentTab?.label || ''} In Catalog`}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
