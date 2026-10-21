'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Star,
  ShoppingCart,
  Heart,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  Plus,
  Minus,
  CheckCircle2,
  Share2,
  Play,
  Film,
  Lock,
  Zap,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ProductCard } from './ProductCard';
import { ReviewsSection } from './ReviewsSection';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const { addToCart, toggleWishlist, isWishlisted, formatPrice } = useCart();
  const productVideos = product.videos && product.videos.length > 0
    ? product.videos
    : (product.media?.filter((m) => m.media_type === 'video').map((m) => m.url) || []);

  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; index: number }>({
    type: 'image',
    index: 0,
  });
  const [quantity, setQuantity] = useState(1);
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isSpecOpen, setIsSpecOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentRating, setCurrentRating] = useState(product.rating || 0);
  const [currentReviewsCount, setCurrentReviewsCount] = useState(product.reviewsCount || 0);

  const wishlisted = isWishlisted(product.id);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation (SEO Breadcrumb List) */}
        <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-800 transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-slate-800 transition-colors capitalize">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Product Section (Ref 1: BDStall layout) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-8 lg:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Image & Video Gallery (5-6 Columns) */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              {/* Big Main Media Container */}
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/70 shadow-inner group flex items-center justify-center">
                {activeMedia.type === 'video' && productVideos[activeMedia.index] ? (
                  <video
                    key={productVideos[activeMedia.index]}
                    controls
                    playsInline
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                    src={productVideos[activeMedia.index]}
                    poster={product.images[0]}
                  >
                    Your browser does not support HTML5 video.
                  </video>
                ) : (
                  <Image
                    src={product.images[activeMedia.index] || product.images[0]}
                    alt={product.title}
                    fill
                    priority
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 bg-white"
                  />
                )}
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-10">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails Strip Underneath (Images + Cloudinary Videos) */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
                {product.images.slice(0, 4).map((img, idx) => (
                  <button
                    key={`img-${idx}`}
                    onClick={() => setActiveMedia({ type: 'image', index: idx })}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-slate-50 transition-all ${
                      activeMedia.type === 'image' && activeMedia.index === idx
                        ? 'border-brand-600 ring-4 ring-brand-500/20 shadow-md'
                        : 'border-slate-200/80 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`${product.title} thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}

                {productVideos.slice(0, 2).map((vid, vIdx) => (
                  <button
                    key={`vid-${vIdx}`}
                    onClick={() => setActiveMedia({ type: 'video', index: vIdx })}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-gradient-to-br from-purple-900 to-indigo-950 transition-all flex flex-col items-center justify-center p-1 text-white ${
                      activeMedia.type === 'video' && activeMedia.index === vIdx
                        ? 'border-purple-400 ring-4 ring-purple-500/30 shadow-md'
                        : 'border-purple-800/60 opacity-80 hover:opacity-100'
                    }`}
                    title="Watch Product Video"
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-purple-200 mt-1">
                      Video
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Details & Actions (6 Columns) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Brand & Stock Pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#F7F9FC] border border-[#E5E7EB] text-[#1F2937] font-extrabold text-xs rounded-full uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>In Stock ({product.stockQuantity} left)</span>
                  </div>
                </div>

                {/* Product Title - Charcoal */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1F2937] tracking-tight leading-snug mb-3">
                  {product.title}
                </h1>

                {/* Ratings & SKU */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <a
                    href="#customer-reviews"
                    className="flex items-center space-x-2 group hover:opacity-80 transition-opacity"
                    title="Jump to customer reviews"
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            currentReviewsCount > 0 && i < Math.floor(currentRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    {currentReviewsCount > 0 ? (
                      <>
                        <span className="text-sm font-bold text-[#1F2937]">{currentRating.toFixed(1)}</span>
                        <span className="text-xs text-[#2563EB] font-semibold underline decoration-dotted">
                          ({currentReviewsCount} verified {currentReviewsCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-[#2563EB] underline decoration-dotted">
                        Write first review
                      </span>
                    )}
                  </a>
                  <span className="text-[#E5E7EB] hidden sm:inline">|</span>
                  <span className="text-xs text-[#6B7280] font-mono">SKU: {product.sku}</span>
                </div>

                <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">
                  {product.shortDescription}
                </p>

                {/* Highlighted Price Pill Container */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#EFF6FF]/70 border border-[#BFDBFE] mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FF6B1A] tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm sm:text-base text-[#6B7280] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#2563EB] bg-[#DBEAFE] px-3 py-1 rounded-full">
                    Best Online Price Guarantee
                  </span>
                </div>

                {/* Actions: Add to Cart & Buy Now Buttons */}
                <div className="space-y-3 mb-8">
                  {/* Row 1: Quantity + Wishlist + Share on mobile */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                      {/* Quantity Picker */}
                      <div className="flex items-center justify-between border-2 border-[#E5E7EB] rounded-2xl px-3 py-2 bg-[#F7F9FC] text-sm flex-1 sm:flex-none">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1.5 text-[#6B7280] hover:text-[#1F2937] font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-bold text-[#1F2937] w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-1.5 text-[#6B7280] hover:text-[#1F2937] font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`p-3 rounded-2xl border-2 transition-all shadow-sm ${
                          wishlisted
                            ? 'border-[#FEE2E2] bg-[#FEF2F2] text-[#DC2626]'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#DC2626] hover:border-[#FEE2E2]'
                        }`}
                        aria-label="Wishlist"
                      >
                        <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#DC2626] text-[#DC2626]' : ''}`} />
                      </button>

                      {/* Share */}
                      <button
                        onClick={handleShare}
                        className="p-3 rounded-2xl border-2 border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] transition-colors"
                        title="Share product link"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex-1 grid grid-cols-2 gap-2.5">
                      {/* ADD TO CART - Deep Navy Primary */}
                      <button
                        onClick={() => addToCart(product, quantity)}
                        className="w-full py-3.5 px-3 sm:px-5 bg-[#0B1F3A] hover:bg-[#122B4F] active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm uppercase tracking-wider"
                      >
                        <ShoppingCart className="w-4 h-4 shrink-0" />
                        <span className="truncate">ADD TO CART</span>
                      </button>

                      {/* BUY NOW - Vivid Orange CTA (#FF6B1A) stands out proudly! */}
                      <button
                        onClick={handleBuyNow}
                        className="w-full py-3.5 px-3 sm:px-5 bg-[#FF6B1A] hover:bg-[#E05507] active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg shadow-[#FF6B1A]/30 hover:shadow-xl transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm uppercase tracking-wider"
                      >
                        {isAuthenticated ? (
                          <>
                            <Zap className="w-4 h-4 fill-white shrink-0" />
                            <span className="truncate">BUY NOW</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 shrink-0" />
                            <span className="truncate">SIGN IN &amp; BUY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {copied && (
                    <div className="text-center text-xs text-[#16A34A] font-semibold">
                      Product link copied to clipboard!
                    </div>
                  )}

                  {/* Phone Hotline CTA Button */}
                  <a
                    href="tel:+919509075612"
                    className="w-full py-3 px-4 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#2563EB] hover:bg-[#EFF6FF]/50 text-[#1F2937] font-bold flex items-center justify-center space-x-2 text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span className="truncate">Order via Phone: +91 95090 75612 / +1 (800) 555-TECH</span>
                  </a>
                </div>

                {/* Trust mini-strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-6 border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Official Manufacturer Warranty</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Express Global Dispatch</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>30 Days Replacement Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Accordions: Description & Full Specification (Ref 1: BDStall) */}
          <div className="mt-12 pt-8 border-t border-slate-100 space-y-4">
            {/* Description Accordion */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm sm:text-base tracking-tight">Product Overview &amp; Description</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDescOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDescOpen && (
                <div className="p-4 sm:p-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
                  <p>{product.description}</p>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Key Hardware Highlights:</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                      {product.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Full Specification Accordion (Ref 1) */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setIsSpecOpen(!isSpecOpen)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm sm:text-base tracking-tight">Full Technical Specifications</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSpecOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSpecOpen && (
                <div className="p-4 sm:p-6 pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(product.specifications).map(([key, val], idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                            <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-700 w-1/3">{key}</td>
                            <td className="py-2.5 px-3 sm:px-4 text-slate-600 font-medium">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Ratings & Reviews */}
        <ReviewsSection
          productId={product.id}
          initialRating={currentRating}
          initialReviewsCount={currentReviewsCount}
          onRatingUpdated={(newRating, newCount) => {
            setCurrentRating(newRating);
            setCurrentReviewsCount(newCount);
          }}
        />

        {/* Related Hardware Accessories Section */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Recommended Related Accessories
              </h2>
              <Link href={`/products?category=${product.category}`} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View More →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
