'use client';

import React from 'react';

export default function SellerOrdersLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-2">
          <div className="w-48 h-7 bg-slate-200 rounded-lg shimmer-effect" />
          <div className="w-64 h-3.5 bg-slate-200 rounded shimmer-effect" />
        </div>
      </div>

      {/* Orders Filter Tabs Skeleton */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-24 h-8 bg-slate-200 rounded-lg shimmer-effect" />
        ))}
      </div>

      {/* Orders List Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-28 h-5 bg-slate-200 rounded shimmer-effect" />
                <div className="w-20 h-5 bg-amber-100 rounded-full shimmer-effect" />
              </div>
              <div className="w-48 h-4 bg-slate-200 rounded shimmer-effect" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-6 bg-slate-200 rounded shimmer-effect" />
              <div className="w-28 h-9 bg-slate-100 rounded-xl shimmer-effect" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
