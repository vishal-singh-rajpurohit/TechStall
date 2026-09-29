'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { X, Star, ShoppingCart, Heart, Check, ArrowRight, Lock, Zap } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const { addToCart, toggleWishlist, isWishlisted, formatPrice } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Gallery */}
        <div className="w-full md:w-1/2 p-6 bg-slate-50 flex flex-col justify-between">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-inner mb-4">
            <Image
              src={product.images[selectedImage] || product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-slate-200'
                }`}
              >
                <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <span>{product.categoryLabel}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{product.brand}</span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-2">
              {product.title}
            </h3>

            {/* Ratings */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-2xl font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discountPercentage && (
                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  Save {product.discountPercentage}%
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quick Specs bullets */}
            <div className="space-y-1.5 mb-6 text-xs text-slate-600">
              {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>{key}:</strong> {val}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Quantity */}
              <div className="flex items-center border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50 text-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-1 text-slate-500 hover:text-slate-900 font-bold"
                >
                  -
                </button>
                <span className="px-2 font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-1 text-slate-500 hover:text-slate-900 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-[100px] py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart</span>
              </button>

              {/* Buy Now CTA */}
              <button
                onClick={handleBuyNow}
                className="flex-1 min-w-[120px] py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg transition-all"
              >
                {isAuthenticated ? (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Buy Now</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In &amp; Buy</span>
                  </>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  wishlisted
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-slate-200 text-slate-500 hover:text-red-500'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            <Link
              href={`/products/${product.id}`}
              onClick={onClose}
              className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center justify-center space-x-1"
            >
              <span>View full technical details & reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
