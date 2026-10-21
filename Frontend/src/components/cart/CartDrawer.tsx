'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, Truck, Lock, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    total,
    freeShippingThreshold,
    formatPrice,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    closeCart();
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7F9FC]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#FF6B1A]" />
              <h2 className="text-lg font-bold text-[#0B1F3A]">Your Shopping Cart</h2>
              <span className="text-xs bg-[#EFF6FF] text-[#2563EB] font-bold px-2 py-0.5 rounded-full border border-[#DBEAFE]">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-200/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator (Ref 2) */}
          <div className="p-4 bg-[#F7F9FC] border-b border-slate-200/80 text-xs">
            <div className="flex items-center justify-between font-medium text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Truck className={`w-4 h-4 ${subtotal >= freeShippingThreshold ? 'text-[#16A34A]' : 'text-[#2563EB]'}`} />
                {subtotal >= freeShippingThreshold ? (
                  <strong className="text-[#16A34A]">You unlocked FREE Worldwide Shipping!</strong>
                ) : (
                  <span>
                    Add <strong className="text-[#0B1F3A]">{formatPrice(remainingForFreeShipping)}</strong> more for FREE Shipping!
                  </span>
                )}
              </span>
              <span className={`font-bold ${subtotal >= freeShippingThreshold ? 'text-[#16A34A]' : 'text-[#2563EB]'}`}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  subtotal >= freeShippingThreshold ? 'bg-[#16A34A]' : 'bg-[#2563EB]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-[#0B1F3A]">Your cart is empty</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Looks like you haven&apos;t added any computer accessories to your cart yet.
                </p>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#FF6B1A] hover:bg-[#E05609] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#FF6B1A]/20"
                >
                  <span>Explore Accessories</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex space-x-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-200/60">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/products/${item.product.id}`}
                          onClick={closeCart}
                          className="text-xs font-semibold text-slate-900 hover:text-[#2563EB] line-clamp-2 transition-colors"
                        >
                          {item.product.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-[#DC2626] transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.product.brand}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 bg-white rounded-lg px-2 py-0.5 space-x-2 text-xs">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-900"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-semibold text-slate-800 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-900"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400">
                            {formatPrice(item.product.price)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-[#16A34A]">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-900">{formatPrice(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Due</span>
                  <span className="text-lg font-black text-[#FF6B1A]">{formatPrice(total)}</span>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold block">Sign In Required to Buy</span>
                    <span className="text-amber-800">
                      You must be logged in to buy products or place orders.
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckoutClick}
                className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm ${
                  isAuthenticated
                    ? 'bg-[#FF6B1A] hover:bg-[#E05609] text-white shadow-[#FF6B1A]/25'
                    : 'bg-[#0B1F3A] hover:bg-[#122B4F] text-white shadow-[#0B1F3A]/25'
                }`}
              >
                {isAuthenticated ? (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Checkout &amp; Buy</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Secure 256-Bit SSL Encryption</span>
                <button
                  onClick={clearCart}
                  className="hover:text-[#DC2626] transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
