'use client';

import React from 'react';
import { MapPin, Phone, ChevronDown, Facebook, Twitter, Instagram, Globe } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function TopBar() {
  const { currency, setCurrency } = useCart();

  return (
    <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        {/* Left: Contact Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-brand-500" />
            <span>Tech Park, Electronic City, Bengaluru, India</span>
          </div>
          <div className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer">
            <Phone className="w-3.5 h-3.5 text-brand-500" />
            <span>Hotline: +91 98765 43210</span>
          </div>
        </div>

        {/* Right: Currency, Language, Socials */}
        <div className="flex items-center space-x-5">
          {/* Currency Selector */}
          <div className="relative flex items-center space-x-1 cursor-pointer group">
            <span className="font-medium text-slate-200">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-transparent text-white font-semibold cursor-pointer focus:outline-none border-none pr-1"
            >
              <option value="INR" className="bg-slate-900 text-white">INR (₹)</option>
              <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
              <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
              <option value="GBP" className="bg-slate-900 text-white">GBP (£)</option>
            </select>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          {/* Language Selector */}
          <div className="flex items-center space-x-1 cursor-pointer hover:text-white transition-colors">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>English</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <div className="h-3 w-px bg-slate-700" />

          {/* Social Links */}
          <div className="flex items-center space-x-3 text-slate-400">
            <a href="#" className="hover:text-brand-500 transition-colors" aria-label="Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="hover:text-brand-500 transition-colors" aria-label="Twitter">
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="hover:text-brand-500 transition-colors" aria-label="Instagram">
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
