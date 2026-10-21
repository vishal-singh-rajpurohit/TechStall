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
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleProductSelect = () => {
    setIsNavigating(true);
    startLoading(`Loading ${product.title.slice(0, 26)}...`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#E5E7EB] hover:border-[#2563EB]/40 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#0B1F3A]/5 flex flex-col justify-between overflow-hidden">
      {/* Product Selection Click Loader Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center space-y-2.5 transition-all">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-2 border-[#2563EB]/20 border-t-[#2563EB] animate-spin" />
            <Loader2 className="w-4 h-4 text-[#2563EB] animate-pulse absolute" />
          </div>
          <span className="text-[11px] font-extrabold text-[#2563EB] tracking-wider uppercase animate-pulse">
            Opening Product...
          </span>
        </div>
      )}

      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
        {product.discountPercentage && product.discountPercentage > 0 && (
          <span className="bg-[#DC2626] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-tight">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.badge && product.badge !== 'SALE' && (
          <span className="bg-[#0B1F3A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </div>

      {/* Top Right Floating Actions (Wishlist & Quick View) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`p-2 rounded-full transition-all duration-200 shadow-sm backdrop-blur-xs ${
            wishlisted
              ? 'bg-[#FEF2F2] text-[#DC2626] ring-2 ring-[#FEE2E2]'
              : 'bg-white/90 text-[#6B7280] hover:text-[#DC2626] hover:bg-white'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? 'fill-[#DC2626] text-[#DC2626]' : ''}`} />
        </button>

        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="p-2 rounded-full bg-white/90 text-[#6B7280] hover:text-[#2563EB] hover:bg-white transition-all shadow-sm backdrop-blur-xs opacity-0 group-hover:opacity-100 hidden sm:block"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F7F9FC] mb-3 group-hover:bg-[#EFF6FF]/40 transition-colors">
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
            <span className="truncate max-w-[60%]">{product.categoryLabel}</span>
            <span className="text-[#1F2937] font-bold truncate max-w-[40%] text-right">{product.brand}</span>
          </div>

          {/* Product Title - Charcoal hover Electric Blue */}
          <Link
            href={`/products/${product.id}`}
            onClick={handleProductSelect}
            className="text-xs sm:text-sm font-bold text-[#1F2937] hover:text-[#2563EB] line-clamp-2 transition-colors mb-1.5 leading-snug"
          >
            {product.title}
          </Link>

          {/* Star Rating & Review Count */}
          <div className="flex items-center space-x-1.5 mb-2.5">
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
                <span className="text-[11px] sm:text-xs font-bold text-[#1F2937]">{product.rating.toFixed(1)}</span>
                <span className="text-[10px] sm:text-[11px] text-[#6B7280] font-medium">({product.reviewsCount})</span>
              </>
            ) : (
              <span className="text-[10px] sm:text-[11px] text-[#6B7280] font-medium">New</span>
            )}
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base md:text-lg font-black text-[#1F2937] tracking-tight leading-none">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] sm:text-xs text-[#6B7280] line-through mt-0.5">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Always accessible Add to Cart Button - Vivid Orange CTA #FF6B1A */}
          <button
            onClick={handleAddToCart}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-sm active:scale-95 ${
              justAdded
                ? 'bg-[#16A34A] text-white'
                : 'bg-[#FF6B1A] hover:bg-[#E05507] text-white shadow-[#FF6B1A]/20'
            }`}
            aria-label="Add to cart"
            title="Add to shopping cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{justAdded ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
