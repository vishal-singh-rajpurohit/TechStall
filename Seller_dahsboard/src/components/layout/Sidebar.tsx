'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  MessageSquare,
  Settings,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Monitor,
  LogOut,
  LogIn,
  User,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useSeller } from '@/context/SellerContext';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { totalProductsCount, pendingOrdersCount, lowStockCount, settings } = useSeller();

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Hardware Products',
      href: '/products',
      icon: Package,
      badge: totalProductsCount,
    },
    {
      label: 'Orders Pipeline',
      href: '/orders',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      label: 'Inventory Health',
      href: '/inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      label: 'Customer Reviews',
      href: '/reviews',
      icon: MessageSquare,
    },
    {
      label: 'Store Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B1F3A] text-slate-300 min-h-screen flex flex-col justify-between border-r border-[#122B4F] shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#122B4F]">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B1A] to-[#FF8C42] flex items-center justify-center text-white shadow-lg shadow-[#FF6B1A]/20 group-hover:scale-105 transition-transform">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-black text-white tracking-tight">Tech</span>
                <span className="text-lg font-black text-[#FF6B1A] tracking-tight">Stall</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block -mt-1">
                Seller Portal
              </span>
            </div>
          </Link>

          <div className="mt-4 p-2.5 rounded-xl bg-[#071527] border border-[#122B4F] flex items-center space-x-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="font-semibold text-slate-200 truncate">{settings.storeName}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#122B4F]/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-[#122B4F] text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Store Link */}
      <div className="p-4 border-t border-[#122B4F] space-y-3">
        {lowStockCount > 0 && (
          <Link
            href="/inventory"
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs hover:bg-red-900/40 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="truncate"><strong>{lowStockCount}</strong> hardware items low in stock!</span>
          </Link>
        )}

        {/* Merchant Account Pill */}
        {session ? (
          <div className="p-2.5 rounded-xl bg-[#071527] border border-[#122B4F] text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#2563EB]/20 text-[#2563EB] font-bold flex items-center justify-center shrink-0 text-[10px]">
                {(session.user as any)?.shopName ? (session.user as any).shopName.slice(0, 1).toUpperCase() : 'M'}
              </div>
              <div className="min-w-0 truncate">
                <div className="font-bold text-white text-[11px] truncate">
                  {(session.user as any)?.shopName || session.user?.name || 'Seller'}
                </div>
                <div className="text-[9px] text-slate-400 truncate">{session.user?.email}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#122B4F] rounded transition-colors ml-1 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FF6B1A] hover:bg-[#E05609] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B1A]/20"
          >
            <div className="flex items-center space-x-2">
              <LogIn className="w-4 h-4" />
              <span>Merchant Sign In</span>
            </div>
          </Link>
        )}

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#071527] hover:bg-[#122B4F] text-slate-300 hover:text-white text-xs font-bold transition-all border border-[#122B4F]"
        >
          <div className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4 text-[#FF6B1A]" />
            <span>Customer Storefront</span>
          </div>
          <span className="text-[10px] text-slate-400">:3000</span>
        </a>

        <div className="px-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>v1.2.0 • Online</span>
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
