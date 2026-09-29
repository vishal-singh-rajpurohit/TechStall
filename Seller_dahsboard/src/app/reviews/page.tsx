'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Reply, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';

export default function CustomerReviewsPage() {
  const { reviews, replyToReview, updateReviewStatus } = useSeller();
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const handleSendReply = (reviewId: string) => {
    if (replyText.trim()) {
      replyToReview(reviewId, replyText.trim());
      setActiveReplyId(null);
      setReplyText('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Reviews &amp; Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review customer sentiments, respond to inquiries, and maintain high merchant ratings.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <div>
            <span className="text-lg font-black text-slate-900">{averageRating}</span>
            <span className="text-xs text-slate-400"> / 5.0 ({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{rev.userName}</span>
                {rev.verified && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">{rev.date}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                Product: {rev.productTitle}
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            {/* Existing Seller Reply */}
            {rev.sellerReply ? (
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/70 space-y-1">
                <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Official Merchant Response:</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{rev.sellerReply}</p>
              </div>
            ) : activeReplyId === rev.id ? (
              /* Reply Form */
              <div className="space-y-3 pt-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write an official merchant reply..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setActiveReplyId(null);
                      setReplyText('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-500 font-bold hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendReply(rev.id)}
                    className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Reply</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setActiveReplyId(rev.id);
                    setReplyText('');
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply to customer</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
