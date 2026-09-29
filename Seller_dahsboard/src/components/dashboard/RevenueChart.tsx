'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Monitor, Laptop, HardDrive, Keyboard } from 'lucide-react';

export function RevenueChart() {
  const [timeframe, setTimeframe] = useState<'12m' | '30d' | '7d'>('12m');

  const monthlyData = [
    { month: 'Oct', revenue: 64000, orders: 180 },
    { month: 'Nov', revenue: 98000, orders: 260 },
    { month: 'Dec', revenue: 145000, orders: 410 },
    { month: 'Jan', revenue: 82000, orders: 220 },
    { month: 'Feb', revenue: 76000, orders: 195 },
    { month: 'Mar', revenue: 89000, orders: 240 },
    { month: 'Apr', revenue: 94000, orders: 255 },
    { month: 'May', revenue: 108000, orders: 290 },
    { month: 'Jun', revenue: 112000, orders: 310 },
    { month: 'Jul', revenue: 105000, orders: 285 },
    { month: 'Aug', revenue: 119000, orders: 330 },
    { month: 'Sep', revenue: 128450, orders: 384 },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  const categories = [
    { name: '4K & OLED Monitors', share: '38%', revenue: '₹4,88,110', color: 'bg-brand-500', icon: Monitor },
    { name: 'Laptops & Workstations', share: '32%', revenue: '₹4,11,040', color: 'bg-amber-500', icon: Laptop },
    { name: 'SSDs & Storage (SST)', share: '20%', revenue: '₹2,56,900', color: 'bg-emerald-500', icon: HardDrive },
    { name: 'Accessories & Docks', share: '10%', revenue: '₹1,28,450', color: 'bg-indigo-500', icon: Keyboard },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Sales Analytics &amp; Velocity</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Growth Trends</h3>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeframe === '7d' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeframe === '30d' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeframe('12m')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeframe === '12m' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* SVG Bar / Trend Chart */}
      <div className="h-64 flex items-end gap-2 sm:gap-4 pt-8 pb-2 border-b border-slate-100">
        {monthlyData.map((item, idx) => {
          const heightPercent = (item.revenue / maxRevenue) * 100;
          const isLatest = idx === monthlyData.length - 1;
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                ₹{item.revenue.toLocaleString('en-IN')} ({item.orders} orders)
              </div>

              {/* Bar */}
              <div
                className={`w-full rounded-t-xl transition-all duration-500 ${
                  isLatest
                    ? 'bg-gradient-to-t from-brand-600 to-amber-500 shadow-md shadow-brand-500/30'
                    : 'bg-slate-200 group-hover:bg-brand-300'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Month label */}
              <span
                className={`text-[10px] font-bold mt-2 ${
                  isLatest ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown Progress Strip */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Hardware Sales by Category</span>
          <span className="text-slate-400">Total: ₹12,84,500.00</span>
        </div>

        {/* Multi-color Progress bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-brand-500 h-full" style={{ width: '38%' }} title="Monitors (38%)" />
          <div className="bg-amber-500 h-full" style={{ width: '32%' }} title="Laptops (32%)" />
          <div className="bg-emerald-500 h-full" style={{ width: '20%' }} title="SSDs & Storage (20%)" />
          <div className="bg-indigo-500 h-full" style={{ width: '10%' }} title="Accessories (10%)" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="flex items-center space-x-2 text-xs">
                <span className={`w-3 h-3 rounded-full ${cat.color} shrink-0`} />
                <div className="truncate">
                  <div className="font-semibold text-slate-800 truncate">{cat.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {cat.share} • {cat.revenue}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
