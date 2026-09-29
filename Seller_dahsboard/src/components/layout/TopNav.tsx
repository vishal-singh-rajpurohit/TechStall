'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  Search,
  Plus,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  X,
  ChevronDown,
  RotateCw,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useSeller } from '@/context/SellerContext';

interface TopNavProps {
  onAddProductClick?: () => void;
}

export function TopNav({ onAddProductClick }: TopNavProps) {
  const { data: session } = useSession();
  const {
    lowStockCount,
    pendingOrdersCount,
    settings,
    orders,
    products,
    isApiConnected,
    isLoading,
    refreshFromBackend,
  } = useSeller();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAlerts = (lowStockCount > 0 ? 1 : 0) + pendingOrdersCount;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, hardware SKUs, or customer inquiries..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Backend API Live Status Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
          <span className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isApiConnected ? 'FastAPI Connected' : 'Syncing Backend...'}</span>
        </div>

        {/* Live Sync Refresh */}
        <button
          onClick={() => refreshFromBackend()}
          disabled={isLoading}
          title="Refresh products & orders from FastAPI"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
        </button>
        {/* Quick Add Product Button */}
        {onAddProductClick ? (
          <button
            onClick={onAddProductClick}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hardware</span>
          </button>
        ) : (
          <Link
            href="/products?action=new"
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hardware</span>
          </Link>
        )}

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Store Notifications
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {totalAlerts} New
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {lowStockCount > 0 && (
                  <Link
                    href="/inventory"
                    onClick={() => setShowNotifications(false)}
                    className="p-3.5 hover:bg-slate-50 flex items-start space-x-3 transition-colors block"
                  >
                    <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Inventory Alert</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {lowStockCount} hardware SKUs reached low-stock threshold.
                      </p>
                    </div>
                  </Link>
                )}

                {pendingOrdersCount > 0 && (
                  <Link
                    href="/orders"
                    onClick={() => setShowNotifications(false)}
                    className="p-3.5 hover:bg-slate-50 flex items-start space-x-3 transition-colors block"
                  >
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Pending Orders</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {pendingOrdersCount} customer orders awaiting packaging & dispatch.
                      </p>
                    </div>
                  </Link>
                )}

                {totalAlerts === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>All orders fulfilled & inventory healthy!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Merchant Profile & Auth State */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          {session ? (
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-brand-500/30 bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Merchant Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{session.user?.name ? session.user.name.slice(0, 2).toUpperCase() : 'ME'}</span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {(session.user as any)?.shopName || session.user?.name || 'Verified Merchant'}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                  {session.user?.email}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Sign Out of Merchant Portal"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
