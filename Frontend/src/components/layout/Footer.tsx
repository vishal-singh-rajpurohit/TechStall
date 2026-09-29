'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, ShieldCheck, Headphones, RefreshCw, Monitor, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Subscription Card (Ref 3: Cobham newsletter style) */}
        <div className="relative mb-16 rounded-3xl bg-gradient-to-r from-brand-600 via-orange-600 to-amber-600 p-8 sm:p-12 text-white shadow-2xl overflow-hidden">
          <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
            <Monitor className="w-80 h-80" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Send className="w-3.5 h-3.5" />
              <span>Stay Ahead of Hardware Deals</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Subscribe to get ₹500 off your first Computer Accessory
            </h3>
            <p className="text-sm text-orange-100 mb-6">
              Get flash sale alerts on 4K OLED monitors, NVMe Gen5 SSDs, and gaming laptops before they sell out.
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>Thank you! Your coupon code <strong>TECH500</strong> has been generated!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-5 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-4 focus:ring-white/40 shadow-inner"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl shrink-0"
                >
                  Subscribe Now
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Multi-Column Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-lg">
                T
              </div>
              <span className="text-xl font-black tracking-tight text-white">TechStall</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-sm">
              Your certified online hub for premium computer hardware, high-refresh OLED monitors, workstations, and high-speed NVMe storage. Verified warranties and worldwide fast delivery.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Hotline: <strong className="text-white">+880 1571 484593</strong> / <strong className="text-white">+1 (800) 555-TECH</strong></div>
              <div>Email: <strong className="text-white">support@techstall.io</strong></div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Hardware</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=monitors" className="hover:text-white transition-colors">4K & OLED Monitors</Link></li>
              <li><Link href="/products?category=laptops" className="hover:text-white transition-colors">Gaming & Ultrabooks</Link></li>
              <li><Link href="/products?category=ssds" className="hover:text-white transition-colors">PCIe Gen5 SSDs (SST)</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-white transition-colors">Custom Keyboards</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-white transition-colors">Ergonomic Mice</Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top Brands</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?brand=ASUS%20ROG" className="hover:text-white transition-colors">ASUS ROG</Link></li>
              <li><Link href="/products?brand=Dell" className="hover:text-white transition-colors">Dell UltraSharp</Link></li>
              <li><Link href="/products?brand=Apple" className="hover:text-white transition-colors">Apple Pro</Link></li>
              <li><Link href="/products?brand=Samsung" className="hover:text-white transition-colors">Samsung Odyssey</Link></li>
              <li><Link href="/products?brand=Crucial" className="hover:text-white transition-colors">Crucial Memory</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">Hardware Lab</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Warranty & Returns</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TechStall Computer Accessories Inc. All rights reserved.</p>
          <div className="flex items-center space-x-3 text-slate-400 font-semibold">
            <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-[10px]">VISA</span>
            <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-[10px]">MASTERCARD</span>
            <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-[10px]">APPLE PAY</span>
            <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-[10px]">PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
