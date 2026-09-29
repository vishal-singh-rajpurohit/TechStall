'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export function Testimonials() {
  const reviews = [
    {
      name: 'Mike Taylor',
      location: 'Austin, Texas',
      role: 'Hardware Engineer & Streamer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment:
        'The ASUS ROG OLED monitor arrived in bulletproof packaging within 48 hours. Zero dead pixels, breathtaking HDR colors, and the 240Hz refresh rate made my previous monitor obsolete.',
      rating: 5,
    },
    {
      name: 'James Lopez',
      location: 'London, UK',
      role: 'DevOps Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      comment:
        'Upgraded our entire team with Dell UltraSharp 34" Curved displays and Crucial Gen5 SSDs. The built-in KVM switch and 90W USB-C power delivery eliminated all desk cable clutter completely.',
      rating: 5,
    },
    {
      name: 'Sarah Lin',
      location: 'Toronto, Canada',
      role: '3D VFX Animator',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      comment:
        'The Samsung 990 PRO 2TB SSD transfer speeds are mind-blowing. Moving multi-gigabyte render caches takes seconds. TechStall is my new go-to for verified computer components.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            What Tech Enthusiasts Say About Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Real feedback from software engineers, competitive gamers, and creative pros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm hover:shadow-xl transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-orange-200/60" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-orange-200">
                  <Image src={rev.avatar} alt={rev.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900">{rev.name}</span>
                    <span title="Verified Customer">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{rev.role}</div>
                  <div className="text-[10px] text-brand-600 font-medium">{rev.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
