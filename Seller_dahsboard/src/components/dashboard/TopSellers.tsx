'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';

export function TopSellers() {
  const { products, restockProduct } = useSeller();

  // Sort by sales count descending
  const sorted = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Best Performing SKUs</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Hardware Sellers</h3>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
        >
          <span>Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {sorted.map((item, idx) => {
          const isLow = item.stockQuantity <= item.lowStockThreshold;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition-all gap-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="text-xs font-black text-slate-400 w-4 text-center">#{idx + 1}</span>
                <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/60">
                  <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                    {item.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {item.brand} • <span className="text-brand-600 font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-extrabold text-slate-900">
                  {item.salesCount} sold
                </div>
                <div className="text-[10px]">
                  {isLow ? (
                    <button
                      onClick={() => restockProduct(item.id, 10)}
                      className="inline-flex items-center space-x-1 text-red-600 font-bold hover:underline"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{item.stockQuantity} left (+10)</span>
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-semibold">{item.stockQuantity} in stock</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
