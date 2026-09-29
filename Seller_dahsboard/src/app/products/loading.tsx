'use client';

import React from 'react';

export default function SellerProductsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-2">
          <div className="w-48 h-7 bg-slate-200 rounded-lg shimmer-effect" />
          <div className="w-64 h-3.5 bg-slate-200 rounded shimmer-effect" />
        </div>
        <div className="w-36 h-10 bg-brand-500/70 rounded-xl shimmer-effect" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="w-56 h-9 bg-slate-100 rounded-lg shimmer-effect" />
          <div className="w-32 h-9 bg-slate-100 rounded-lg shimmer-effect" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-100 shimmer-effect flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-3/4 h-4 bg-slate-200 rounded shimmer-effect" />
                  <div className="w-1/3 h-3 bg-slate-200 rounded shimmer-effect" />
                </div>
              </div>
              <div className="w-20 h-4 bg-slate-200 rounded shimmer-effect" />
              <div className="w-16 h-4 bg-slate-200 rounded shimmer-effect" />
              <div className="w-20 h-6 bg-emerald-100 rounded-full shimmer-effect" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
