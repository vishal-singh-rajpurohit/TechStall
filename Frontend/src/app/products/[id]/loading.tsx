'use client';

import React from 'react';
import { Cpu, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';

export default function ProductDetailLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <div className="w-12 h-3.5 bg-slate-200 rounded shimmer-effect" />
          <span>/</span>
          <div className="w-16 h-3.5 bg-slate-200 rounded shimmer-effect" />
          <span>/</span>
          <div className="w-32 h-3.5 bg-slate-200 rounded shimmer-effect" />
        </div>

        {/* Main Product Skeleton Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Image Gallery Skeleton (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200/60 shimmer-effect flex items-center justify-center overflow-hidden">
              <div className="flex flex-col items-center justify-center text-slate-300">
                <Cpu className="w-16 h-16 animate-pulse text-brand-300/60" />
                <span className="text-xs font-semibold mt-2 text-slate-400">Loading Product View...</span>
              </div>
            </div>

            {/* Thumbnail Skeletons */}
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-slate-100 border border-slate-200/60 shimmer-effect"
                />
              ))}
            </div>
          </div>

          {/* Right: Product Meta & Purchase Skeleton (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Badge & Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-20 h-6 bg-brand-100/70 rounded-full shimmer-effect" />
                <div className="w-24 h-4 bg-slate-200 rounded shimmer-effect" />
              </div>

              {/* Title Skeleton */}
              <div className="space-y-2">
                <div className="w-full h-8 bg-slate-200 rounded-lg shimmer-effect" />
                <div className="w-3/4 h-8 bg-slate-200 rounded-lg shimmer-effect" />
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-2">
                <div className="w-24 h-4 bg-amber-100 rounded shimmer-effect" />
                <div className="w-16 h-4 bg-slate-200 rounded shimmer-effect" />
              </div>

              {/* Price Banner Skeleton */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <div className="w-36 h-10 bg-slate-300 rounded-xl shimmer-effect" />
                <div className="w-24 h-5 bg-slate-200 rounded shimmer-effect" />
                <div className="w-16 h-6 bg-red-100 rounded-full shimmer-effect" />
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2 pt-2">
                <div className="w-full h-3.5 bg-slate-200 rounded shimmer-effect" />
                <div className="w-11/12 h-3.5 bg-slate-200 rounded shimmer-effect" />
                <div className="w-4/5 h-3.5 bg-slate-200 rounded shimmer-effect" />
              </div>

              {/* Key Features Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-9 bg-slate-50 rounded-xl border border-slate-200/50 p-2 flex items-center space-x-2 shimmer-effect">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-200" />
                    <div className="w-3/4 h-3 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions & Guarantee Skeleton */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 h-14 bg-brand-500/80 rounded-2xl shimmer-effect" />
                <div className="sm:w-48 h-14 bg-slate-900/80 rounded-2xl shimmer-effect" />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-slate-300" />
                  <div className="w-24 h-3 bg-slate-200 rounded shimmer-effect" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                  <div className="w-32 h-3 bg-slate-200 rounded shimmer-effect" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Related Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="w-48 h-6 bg-slate-200 rounded shimmer-effect" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl border border-slate-100 p-2.5 flex justify-between shimmer-effect">
                <div className="w-1/3 h-3 bg-slate-200 rounded" />
                <div className="w-1/3 h-3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
