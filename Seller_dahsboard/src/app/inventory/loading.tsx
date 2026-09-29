'use client';

import React from 'react';

export default function SellerInventoryLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-2">
          <div className="w-48 h-7 bg-slate-200 rounded-lg shimmer-effect" />
          <div className="w-64 h-3.5 bg-slate-200 rounded shimmer-effect" />
        </div>
      </div>

      {/* KPI Micro Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-24 h-4 bg-slate-200 rounded shimmer-effect" />
            <div className="w-32 h-7 bg-slate-300 rounded-lg shimmer-effect" />
          </div>
        ))}
      </div>

      {/* Inventory Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 shimmer-effect flex-shrink-0" />
              <div className="w-1/2 h-4 bg-slate-200 rounded shimmer-effect" />
            </div>
            <div className="w-20 h-4 bg-slate-200 rounded shimmer-effect" />
            <div className="w-24 h-8 bg-slate-100 rounded-lg shimmer-effect" />
          </div>
        ))}
      </div>
    </div>
  );
}
