'use client';

import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="space-y-2">
            <div className="w-48 h-7 bg-slate-200 rounded-lg shimmer-effect" />
            <div className="w-64 h-3.5 bg-slate-200 rounded shimmer-effect" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-32 h-10 bg-slate-100 rounded-xl shimmer-effect" />
            <div className="w-40 h-10 bg-slate-100 rounded-xl shimmer-effect" />
          </div>
        </div>

        {/* Catalog Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filter Skeleton (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="w-24 h-5 bg-slate-200 rounded shimmer-effect" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded bg-slate-200 shimmer-effect" />
                  <div className="w-28 h-3.5 bg-slate-200 rounded shimmer-effect" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="w-28 h-5 bg-slate-200 rounded shimmer-effect" />
              <div className="w-full h-2 bg-slate-200 rounded shimmer-effect" />
              <div className="flex justify-between">
                <div className="w-16 h-4 bg-slate-200 rounded shimmer-effect" />
                <div className="w-16 h-4 bg-slate-200 rounded shimmer-effect" />
              </div>
            </div>
          </div>

          {/* Right Product Grid Skeleton (9 cols) */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-100 shimmer-effect" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-16 h-3 bg-slate-200 rounded shimmer-effect" />
                    <div className="w-12 h-3 bg-slate-200 rounded shimmer-effect" />
                  </div>
                  <div className="w-full h-4 bg-slate-200 rounded shimmer-effect" />
                  <div className="w-2/3 h-4 bg-slate-200 rounded shimmer-effect" />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="w-24 h-6 bg-slate-200 rounded-md shimmer-effect" />
                  <div className="w-8 h-8 rounded-lg bg-slate-100 shimmer-effect" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
