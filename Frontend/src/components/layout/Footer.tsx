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
    <footer className="bg-[#0B1F3A] text-slate-300 pt-16 pb-24 md:pb-12 border-t border-[#122B4F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Multi-Column Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#FF6B1A] flex items-center justify-center text-white font-black text-lg shadow-sm">
                T
              </div>
              <span className="text-xl font-black tracking-tight text-white">Tech<span className="text-[#FF6B1A]">Stall</span></span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 max-w-sm">
              Your certified online hub for premium computer hardware, high-refresh OLED monitors, workstations, and high-speed NVMe storage. Verified warranties and worldwide fast delivery.
            </p>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Hotline: <strong className="text-white">+91 95090 75612</strong></div>
              <div>Email: <a href="mailto:vishalsinghraj2005@outlook.com" className="hover:text-[#2563EB] transition-colors"><strong className="text-white">vishalsinghraj2005@outlook.com</strong></a></div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Hardware</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=monitors" className="text-slate-300 hover:text-white transition-colors">4K &amp; OLED Monitors</Link></li>
              <li><Link href="/products?category=laptops" className="text-slate-300 hover:text-white transition-colors">Gaming &amp; Ultrabooks</Link></li>
              <li><Link href="/products?category=ssds" className="text-slate-300 hover:text-white transition-colors">PCIe Gen5 SSDs (SST)</Link></li>
              <li><Link href="/products?category=accessories" className="text-slate-300 hover:text-white transition-colors">Custom Keyboards</Link></li>
              <li><Link href="/products?category=accessories" className="text-slate-300 hover:text-white transition-colors">Ergonomic Mice</Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top Brands</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?brand=ASUS%20ROG" className="text-slate-300 hover:text-white transition-colors">ASUS ROG</Link></li>
              <li><Link href="/products?brand=Dell" className="text-slate-300 hover:text-white transition-colors">Dell UltraSharp</Link></li>
              <li><Link href="/products?brand=Apple" className="text-slate-300 hover:text-white transition-colors">Apple Pro</Link></li>
              <li><Link href="/products?brand=Samsung" className="text-slate-300 hover:text-white transition-colors">Samsung Odyssey</Link></li>
              <li><Link href="/products?brand=Crucial" className="text-slate-300 hover:text-white transition-colors">Crucial Memory</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support &amp; Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">Hardware Lab</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-white transition-colors">Warranty &amp; Returns</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 border-t border-[#122B4F] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TechStall Computer Accessories Inc. All rights reserved.</p>
          <div className="flex items-center space-x-3 text-slate-300 font-semibold">
            <span className="px-2 py-1 bg-[#061224] rounded border border-[#122B4F] text-[10px]">VISA</span>
            <span className="px-2 py-1 bg-[#061224] rounded border border-[#122B4F] text-[10px]">MASTERCARD</span>
            <span className="px-2 py-1 bg-[#061224] rounded border border-[#122B4F] text-[10px]">APPLE PAY</span>
            <span className="px-2 py-1 bg-[#061224] rounded border border-[#122B4F] text-[10px]">PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
