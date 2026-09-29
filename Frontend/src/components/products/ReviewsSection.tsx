'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  Sparkles,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  User,
} from 'lucide-react';
import { reviewAPI } from '@/lib/api';
import { Review, ProductReviewsData } from '@/types';

interface ReviewsSectionProps {
  productId: string;
  initialRating?: number;
  initialReviewsCount?: number;
  onRatingUpdated?: (newRating: number, newCount: number) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Poor',
  2: '2 - Fair',
  3: '3 - Average',
  4: '4 - Good & Recommended',
  5: '5 - Excellent & Highly Recommended!',
};

const SUGGESTED_TAGS = [
  '⚡ Blazing fast performance',
  '🛡️ Premium build quality',
  '💰 Great value for money',
  '🔇 Ultra quiet & cool',
  '📦 Secure packaging & fast delivery',
];

export function ReviewsSection({
  productId,
  initialRating = 0,
  initialReviewsCount = 0,
  onRatingUpdated,
}: ReviewsSectionProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const currentUserId = (session?.user as any)?.id;
  const currentUserName = session?.user?.name || 'Customer';

  const [reviewsData, setReviewsData] = useState<ProductReviewsData>({
    productId,
    averageRating: initialRating,
    reviewsCount: initialReviewsCount,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);

  // Filters & Sorting
  const [starFilter, setStarFilter] = useState<number | null>(null); // null = all
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Load reviews on mount
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await reviewAPI.getProductReviews(productId);
      if (res) {
        const formattedReviews: Review[] = (res.reviews || []).map((r: any) => ({
          id: String(r.id),
          userId: String(r.userId),
          userName: r.userName || 'Verified Buyer',
          rating: Number(r.rating) || 5,
          date: r.created_at
            ? new Date(r.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Recent',
          comment: r.content || '',
          verified: true,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));

        const breakdown = res.rating_breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const avg = Number(res.average_rating) || 0;
        const count = Number(res.reviews_count) || formattedReviews.length;

        setReviewsData({
          productId,
          averageRating: avg,
          reviewsCount: count,
          ratingBreakdown: breakdown,
          reviews: formattedReviews,
        });

        if (onRatingUpdated) {
          onRatingUpdated(avg, count);
        }

        // Check if user has already reviewed
        if (currentUserId) {
          const userRev = formattedReviews.find((r) => r.userId === currentUserId);
          if (userRev) {
            setMyReviewId(userRev.id);
          }
        }
      }
    } catch (err: any) {
      console.warn('Could not load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, currentUserId]);

  // Check my review when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      reviewAPI
        .getMyReview(productId)
        .then((myRev) => {
          if (myRev && myRev.id) {
            setMyReviewId(String(myRev.id));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, productId]);

  const handleStartReview = (prefill?: Review) => {
    if (prefill) {
      setRating(prefill.rating);
      setContent(prefill.comment);
      setIsEditing(true);
    } else {
      setRating(5);
      setContent('');
      setIsEditing(false);
    }
    setIsFormOpen(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setError(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter a few words about your experience with this product.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await reviewAPI.submitReview(productId, rating, content.trim());
      setSuccessMsg(
        isEditing
          ? 'Your review has been successfully updated!'
          : 'Thank you! Your verified review has been published.'
      );
      setIsFormOpen(false);
      setIsEditing(false);
      await fetchReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      setIsLoading(true);
      await reviewAPI.deleteReview(productId, myReviewId || undefined);
      setMyReviewId(null);
      setSuccessMsg('Your review was successfully removed.');
      await fetchReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to delete review.');
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setContent((prev) => {
      const cleanTag = tag.replace(/^[^\w\s]+\s*/, '');
      if (prev.includes(cleanTag)) return prev;
      return prev ? `${prev}. ${cleanTag}` : cleanTag;
    });
  };

  // Filtered & Sorted reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviewsData.reviews];

    if (starFilter !== null) {
      list = list.filter((r) => r.rating === starFilter);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }

    return list;
  }, [reviewsData.reviews, starFilter, sortBy]);

  // Color mapping for rating breakdown bars
  const getBarColor = (stars: number) => {
    if (stars >= 5) return 'bg-emerald-500';
    if (stars === 4) return 'bg-sky-500';
    if (stars === 3) return 'bg-amber-400';
    if (stars === 2) return 'bg-orange-400';
    return 'bg-rose-500';
  };

  return (
    <div id="customer-reviews" className="mt-12 pt-10 border-t border-slate-200 scroll-mt-24">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer Ratings &amp; Reviews
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real feedback and ratings verified from genuine TechStall buyers.
          </p>
        </div>

        {/* Write a review button in header */}
        {!isFormOpen && (
          <div>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  const existing = myReviewId
                    ? reviewsData.reviews.find((r) => r.id === myReviewId)
                    : undefined;
                  handleStartReview(existing);
                }}
                className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{myReviewId ? 'Edit Your Review' : 'Write a Review'}</span>
              </button>
            ) : (
              <Link
                href={`/auth/signin?callbackUrl=/products/${productId}#customer-reviews`}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In to Review</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Global Success / Error Alerts */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ratings Overview Card (Grid Layout) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Big Score Summary (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center md:border-r border-slate-100 md:pr-6 text-center">
            <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-2">
              {reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : '0.0'}
            </div>
            
            <div className="flex text-amber-400 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(reviewsData.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>

            <div className="text-xs sm:text-sm font-semibold text-slate-700">
              {reviewsData.reviewsCount > 0
                ? `Based on ${reviewsData.reviewsCount} customer ${
                    reviewsData.reviewsCount === 1 ? 'review' : 'reviews'
                  }`
                : 'No reviews yet for this product'}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Authentic Customer Ratings</span>
            </div>
          </div>

          {/* Star Distribution Bars (8 cols) */}
          <div className="md:col-span-8 flex flex-col space-y-2.5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rating Distribution
            </div>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewsData.ratingBreakdown[stars] || 0;
              const percent =
                reviewsData.reviewsCount > 0
                  ? Math.round((count / reviewsData.reviewsCount) * 100)
                  : 0;
              const isSelected = starFilter === stars;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setStarFilter(isSelected ? null : stars)}
                  className={`w-full group flex items-center space-x-3 text-xs p-1.5 rounded-xl transition-colors ${
                    isSelected ? 'bg-slate-100 ring-2 ring-brand-500/20' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="w-12 text-left font-bold text-slate-700 shrink-0 flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>

                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                        stars
                      )}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-14 text-right text-slate-500 font-semibold text-[11px] shrink-0">
                    {percent}% ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Review Form Modal/Drawer */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl border-2 border-brand-500/40 p-4 sm:p-8 shadow-lg shadow-brand-500/5 mb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEditing ? 'Update Your Product Review' : 'Rate & Review This Product'}
                </h3>
                <p className="text-xs text-slate-500">
                  Posting publicly as <strong className="text-slate-800">{currentUserName}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelForm}
              className="text-slate-400 hover:text-slate-600 p-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Star Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Your Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled =
                      hoverRating > 0 ? starVal <= hoverRating : starVal <= rating;

                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        title={RATING_LABELS[starVal]}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'fill-slate-100 text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Quick Inspiration Tags */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Quick Tags (Click to add):
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTagClick(t)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Your Detailed Review <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={1000}
                placeholder="What did you like or dislike about this product? How is the build quality, performance, and overall value?"
                className="w-full p-4 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all leading-relaxed"
                required
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span>Minimum 3 characters</span>
                <span>{content.length} / 1000 characters</span>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="py-3 px-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Review...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isEditing ? 'Save Changes' : 'Submit Verified Review'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelForm}
                className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
        {/* Star Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setStarFilter(null)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              starFilter === null
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({reviewsData.reviewsCount})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviewsData.ratingBreakdown[s] || 0;
            if (count === 0 && starFilter !== s) return null;

            return (
              <button
                key={s}
                onClick={() => setStarFilter(s === starFilter ? null : s)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                  starFilter === s
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{s}★</span>
                <span className="opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews Feed */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading verified reviews...</p>
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              {starFilter !== null
                ? `No ${starFilter}-star reviews found`
                : 'No Customer Reviews Yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {starFilter !== null
                ? 'Try resetting the filter to see reviews from all rating tiers.'
                : 'Be the first verified customer to share your thoughts on this product!'}
            </p>
          </div>
          {starFilter !== null ? (
            <button
              onClick={() => setStarFilter(null)}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              Show all reviews
            </button>
          ) : (
            isAuthenticated && (
              <button
                onClick={() => handleStartReview()}
                className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Write First Review
              </button>
            )
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((rev) => {
            const isMyReview = currentUserId && rev.userId === currentUserId;

            return (
              <div
                key={rev.id}
                className={`bg-white rounded-3xl border p-4 sm:p-7 transition-all shadow-sm ${
                  isMyReview
                    ? 'border-brand-400/50 bg-brand-50/20 ring-2 ring-brand-500/10'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  {/* User Profile & Badge */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-brand-500/20">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{rev.userName}</span>
                        {isMyReview && (
                          <span className="bg-brand-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-bold mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Buyer</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars & Date */}
                  <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{rev.date}</span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mt-2 whitespace-pre-line">
                  {rev.comment}
                </div>

                {/* Actions for current user's review */}
                {isMyReview && (
                  <div className="mt-4 pt-3 border-t border-brand-200/50 flex items-center justify-end space-x-3">
                    <button
                      onClick={() => handleStartReview(rev)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Review</span>
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
