'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Zap, Truck, CheckCircle2, Cpu } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-[#F7F9FC] pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Hero Banner (Left 8 Columns) */}
          <div className="lg:col-span-8 relative rounded-3xl bg-white border border-[#E5E7EB] p-6 sm:p-10 lg:p-12 shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full">
              {/* Left Column: Headlines & Call to Action */}
              <div className="md:col-span-7 flex flex-col justify-center">
                <div className="inline-flex items-center space-x-2 bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB] animate-pulse" />
                  <span>Next-Gen Computer Hardware</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#1F2937] tracking-tight leading-[1.18] mb-4">
                  Your One-Stop{' '}
                  <span className="bg-gradient-to-r from-[#0B1F3A] via-[#2563EB] to-[#FF6B1A] bg-clip-text text-transparent">
                    Electronic &amp; Hardware
                  </span>{' '}
                  Market
                </h1>

                <p className="text-sm sm:text-base text-[#6B7280] mb-6 leading-relaxed">
                  Upgrade your battle station and productivity setup with certified 4K OLED displays, ultra-fast PCIe 5.0 SSDs, and premium workstations.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 mb-6">
                  {/* Primary CTA - Vivid Orange */}
                  <Link
                    href="/products"
                    className="px-7 py-3.5 bg-[#FF6B1A] hover:bg-[#E05507] active:scale-[0.98] text-white font-extrabold rounded-2xl shadow-lg shadow-[#FF6B1A]/25 hover:shadow-[#FF6B1A]/40 transition-all flex items-center space-x-2 text-sm"
                  >
                    <span>Shop Hardware Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Secondary CTA - Electric Blue Accent */}
                  <Link
                    href="/products?category=monitors"
                    className="px-6 py-3.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] active:scale-[0.98] font-bold rounded-2xl transition-all text-sm border border-[#BFDBFE]"
                  >
                    View 4K Displays
                  </Link>
                </div>

                {/* Trust Badges - Green Success Checkmarks */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#E5E7EB] text-xs font-semibold text-[#6B7280]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Official Warranties
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Zero Cost EMI
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Express Dispatch
                  </span>
                </div>
              </div>

              {/* Right Column: High-Impact Visual Showcase */}
              <div className="md:col-span-5 flex items-center justify-center">
                <div className="relative w-full max-w-[320px] aspect-[4/3] md:aspect-[3/4] lg:aspect-square rounded-3xl overflow-hidden shadow-xl border border-[#E5E7EB] bg-[#0B1F3A] group">
                  <Image
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
                    alt="Workstation laptop and accessories"
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Floating Badge - Vivid Orange */}
                  <div className="absolute top-3.5 right-3.5 bg-[#FF6B1A] text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                    Featured Gear
                  </div>

                  {/* Bottom Specs Tag */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs bg-[#0B1F3A]/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
                    <span className="font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
                      Pro Workstation
                    </span>
                    <span className="text-[#FF6B1A] font-extrabold">From ₹79,999</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Promotional Split Cards (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            {/* Card 1: Free Shipping Card */}
            <div className="relative flex-1 rounded-3xl bg-white border border-[#E5E7EB] p-6 sm:p-7 overflow-hidden flex flex-col justify-between shadow-xs">
              <div className="relative z-10">
                <span className="text-[11px] font-extrabold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Truck className="w-4 h-4 text-[#2563EB]" />
                  <span>Free Delivery</span>
                </span>
                <h3 className="text-xl font-black text-[#1F2937] leading-snug mb-1.5">
                  Free Shipping Everywhere!
                </h3>
                <p className="text-xs text-[#6B7280] mb-4 leading-relaxed">
                  Special for orders over ₹1,499 with express insured tracking.
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/products?category=ssds"
                  className="inline-flex items-center text-xs font-bold text-[#FF6B1A] hover:text-[#E05507] space-x-1 group"
                >
                  <span>Explore Storage</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none">
                <Zap className="w-full h-full text-[#2563EB]" />
              </div>
            </div>

            {/* Card 2: Deep Navy Clearance Card with Vivid Orange CTA */}
            <div className="relative flex-1 rounded-3xl bg-[#0B1F3A] text-white border border-[#122B4F] p-6 sm:p-7 overflow-hidden flex flex-col justify-between shadow-md">
              <div className="relative z-10">
                <span className="text-[11px] font-extrabold text-[#FF6B1A] uppercase tracking-wider mb-2 block">
                  Limited Clearance
                </span>
                <h3 className="text-xl font-black text-white leading-snug mb-1.5">
                  Hardware Clearance Deals
                </h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Up to 25% promo for all selected 4K OLED Monitors and NVMe SSDs.
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/products?limitedSale=true"
                  className="inline-block px-5 py-2.5 bg-[#FF6B1A] hover:bg-[#E05507] text-white font-bold rounded-xl text-xs shadow-md transition-colors active:scale-95"
                >
                  Shop Now
                </Link>
              </div>
              <div className="absolute right-3 bottom-3 w-28 h-28 opacity-15 pointer-events-none">
                <Shield className="w-full h-full text-[#2563EB]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
