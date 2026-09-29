'use client';

import React from 'react';
import { Cpu } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="w-20 h-20 rounded-full border-4 border-brand-500/20 border-t-brand-600 animate-spin" />
        {/* Central Brand Icon */}
        <div className="absolute w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-brand-600 shadow-inner">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
      </div>
      <div className="mt-5 text-center">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Loading Hardware...</h3>
        <p className="text-xs text-slate-400 mt-1">Connecting to live catalog</p>
      </div>
    </div>
  );
}
