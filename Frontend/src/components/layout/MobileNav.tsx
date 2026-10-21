'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';

export function MobileNav() {
  const pathname = usePathname();
  const { totalItems, wishlist, openCart } = useCart();
  const { data: session } = useSession();

  const isHome = pathname === '/';
  const isCatalog = pathname === '/products';
  const isOrders = pathname === '/orders';
  const isAuth = pathname.startsWith('/auth');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1F3A]/95 backdrop-blur-md border-t border-[#122B4F] md:hidden pt-2 pb-2.5 px-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className={`flex flex-col items-center transition-colors ${
            isHome ? 'text-[#2563EB] font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>

        <Link
          href="/products"
          className={`flex flex-col items-center transition-colors ${
            isCatalog ? 'text-[#2563EB] font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Catalog</span>
        </Link>

        {/* Center Cart Button - Vivid Orange CTA */}
        <button
          onClick={openCart}
          className="relative -top-4 w-12 h-12 rounded-full bg-[#FF6B1A] text-white flex items-center justify-center shadow-lg shadow-[#FF6B1A]/40 border-4 border-[#0B1F3A] active:scale-95 transition-transform"
          aria-label="Open cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-[#FF6B1A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>

        <Link
          href="/products?wishlisted=true"
          className="relative flex flex-col items-center text-slate-300 hover:text-white transition-colors"
        >
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 right-1 bg-[#DC2626] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
          <span className="text-[10px] font-medium mt-1">Saved</span>
        </Link>

        <Link
          href={session?.user ? '/orders' : '/auth/signin'}
          className={`flex flex-col items-center transition-colors ${
            isOrders || isAuth ? 'text-[#2563EB] font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">
            {session?.user ? 'Orders' : 'Sign In'}
          </span>
        </Link>
      </div>
    </div>
  );
}
