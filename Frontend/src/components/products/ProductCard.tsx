'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { usePageLoader } from '@/components/layout/NavigationProgressBar';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, formatPrice } = useCart();
  const { startLoading } = usePageLoader();
  const [isNavigating, setIsNavigating] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleProductSelect = () => {
    setIsNavigating(true);
    startLoading(`Loading ${product.title.slice(0, 26)}...`);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/40 p-2.5 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 flex flex-col justify-between overflow-hidden">
      {/* Product Selection Click Loader Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center space-y-2.5 transition-all">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-2 border-brand-500/20 border-t-brand-600 animate-spin" />
            <Loader2 className="w-4 h-4 text-brand-600 animate-pulse absolute" />
          </div>
          <span className="text-[11px] font-extrabold text-brand-600 tracking-wider uppercase animate-pulse">
            Opening Product...
          </span>
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1">
        {product.discountPercentage && product.discountPercentage > 0 && (
          <span className="bg-red-500 text-white text-[9px] sm:text-[11px] font-extrabold px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-sm">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.badge && product.badge !== 'SALE' && (
          <span className="bg-slate-900 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </div>

      {/* Wishlist Button (Always visible on mobile, hover on desktop) */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-sm ${
          wishlisted
            ? 'bg-red-50 text-red-500 ring-2 ring-red-200'
            : 'bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white'
        }`}
        title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        aria-label="Wishlist"
      >
        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Product Image & Quick Action Overlay */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3.5 group-hover:bg-slate-100/60 transition-colors">
        <Link
          href={`/products/${product.id}`}
          onClick={handleProductSelect}
          className="block w-full h-full"
        >
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Hover Quick Actions */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => addToCart(product, 1)}
            className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="p-2 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-md hover:text-brand-600 transition-colors"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span className="truncate max-w-[60%]">{product.categoryLabel}</span>
            <span className="text-slate-500 truncate max-w-[40%] text-right">{product.brand}</span>
          </div>

          {/* Product Title */}
          <Link
            href={`/products/${product.id}`}
            onClick={handleProductSelect}
            className="text-xs sm:text-sm font-bold text-slate-800 hover:text-brand-600 line-clamp-2 transition-colors mb-1.5 sm:mb-2 leading-snug"
          >
            {product.title}
          </Link>

          {/* Star Rating & Review Count */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 mb-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                    product.reviewsCount > 0 && i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>
            {product.reviewsCount > 0 ? (
              <>
                <span className="text-[11px] sm:text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">({product.reviewsCount})</span>
              </>
            ) : (
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">New</span>
            )}
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
          <div>
            <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            className="sm:hidden p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 active:scale-95 transition-all shadow-sm shrink-0"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
