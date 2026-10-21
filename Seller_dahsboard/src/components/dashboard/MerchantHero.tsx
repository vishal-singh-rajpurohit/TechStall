'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSeller } from '@/context/SellerContext';
import {
  Sparkles,
  PlusCircle,
  Package,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function MerchantHero() {
  const { data: session } = useSession();
  const {
    settings,
    totalRevenue,
    totalProductsCount,
    pendingOrdersCount,
    processingOrdersCount,
    lowStockCount,
    isApiConnected,
  } = useSeller();

  const storeName =
    (session?.user as any)?.shopName ||
    session?.user?.name ||
    settings?.storeName ||
    'Merchant';
  const activeOrders = pendingOrdersCount + processingOrdersCount;

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#0B1F3A] via-[#0D2444] to-[#0B1F3A] border border-[#1E3A66] p-6 sm:p-8 text-white shadow-xl overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B1A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#2563EB]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Store Greeting & Summary */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FF6B1A]/15 text-[#FF8C42] border border-[#FF6B1A]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B1A]" />
              <span>Merchant Command Center</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#16A34A]/15 text-[#22C55E] border border-[#16A34A]/30">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
              <span>{isApiConnected ? 'Backend Live & Synced' : 'Store Active'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B1A] to-[#FFA366]">{storeName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Real-time analytics, inventory management, and live order pipeline. You currently have{' '}
            <strong className="text-white font-bold">{totalProductsCount} hardware SKUs</strong> active in your store.
          </p>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#FF6B1A] hover:bg-[#E05609] active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-lg shadow-[#FF6B1A]/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Hardware</span>
            </Link>

            <Link
              href="/orders"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#122B4F]/80 hover:bg-[#1A3B6B] active:scale-[0.98] text-slate-200 hover:text-white font-semibold rounded-xl text-xs border border-[#1E3A66] transition-all"
            >
              <Package className="w-4 h-4 text-[#2563EB]" />
              <span>Orders ({activeOrders} active)</span>
            </Link>

            <Link
              href="/inventory"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#122B4F]/80 hover:bg-[#1A3B6B] active:scale-[0.98] text-slate-200 hover:text-white font-semibold rounded-xl text-xs border border-[#1E3A66] transition-all"
            >
              <Boxes className="w-4 h-4 text-[#FF6B1A]" />
              <span>Inventory ({lowStockCount > 0 ? `${lowStockCount} alerts` : 'Healthy'})</span>
            </Link>
          </div>
        </div>

        {/* Right: Quick Micro-Metrics Pill Board */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 min-w-[280px]">
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Live Revenue</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black text-emerald-400">
                ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400/80" />
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Active SKUs</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black text-white">{totalProductsCount}</span>
              <Layers className="w-4 h-4 text-brand-400/80" />
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Fulfillment Queue</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black text-amber-400">{activeOrders}</span>
              <Activity className="w-4 h-4 text-amber-400/80" />
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Stock Status</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className={`text-xs font-bold ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lowStockCount > 0 ? `${lowStockCount} Need Restock` : 'Optimal'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
