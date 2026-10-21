'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, ExternalLink, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function TopBar() {
  const { currency } = useCart();

  return (
    <div className="bg-[#061224] text-slate-300 text-[11px] border-b border-[#122B4F]/80 hidden sm:block select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
        {/* Left: Announcement & Value Proposition */}
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center gap-1.5 text-[#FF6B1A] font-semibold">
            <Zap className="w-3 h-3 text-[#FF6B1A] fill-[#FF6B1A] animate-pulse" />
            <span>Certified 2026 Hardware</span>
          </div>
        </div>

        {/* Right: Quick Links, Support & Seller Portal */}
        <div className="flex items-center space-x-4">
          <a
            href="tel:+919509075612"
            className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-[#2563EB]" />
            <span>Support: +91 95090 75612</span>
          </a>

          <div className="h-3 w-px bg-[#122B4F]" />

          {/* Currency indicator */}
          <span className="font-bold text-slate-200">
            {currency === 'INR' ? '₹ INR' : currency}
          </span>

          <div className="h-3 w-px bg-[#122B4F]" />

          {/* Direct link to Seller Dashboard */}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-slate-200 hover:text-[#FF6B1A] font-semibold transition-colors group"
          >
            <span>Seller Hub</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#FF6B1A] transition-colors" />
          </a>
        </div>
      </div>
    </div>
  );
}
