'use client';

import React from 'react';
import { Headphones, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Headphones,
      title: 'Responsive',
      desc: 'Expert tech customer service available 24/7',
    },
    {
      icon: ShieldCheck,
      title: 'Secure',
      desc: '100% Certified authentic computer hardware',
    },
    {
      icon: Truck,
      title: 'Shipping',
      desc: 'Free, fast, and insured worldwide delivery',
    },
    {
      icon: RotateCcw,
      title: 'Transparent',
      desc: 'Hassle-free 30-day returns & warranty exchange',
    },
  ];

  return (
    <section className="bg-white py-10 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {badges.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center shrink-0 border border-orange-100">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
