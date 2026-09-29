'use client';

import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-600 animate-spin" />
        <div className="absolute w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-brand-600 shadow-inner">
          <LayoutDashboard className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Loading Dashboard...</h3>
        <p className="text-xs text-slate-400 mt-0.5">Fetching live metrics & analytics</p>
      </div>
    </div>
  );
}
