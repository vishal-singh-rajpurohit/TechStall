'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, Monitor, Laptop, HardDrive, Keyboard } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';

export function RevenueChart() {
  const [timeframe, setTimeframe] = useState<'12m' | '30d' | '7d'>('12m');
  const { orders, totalRevenue } = useSeller();

  // Compute live periodic revenue based on seller orders
  const { periodData, categoryBreakdown, maxRevenue } = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');

    // 1. Generate month intervals for the selected timeframe
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    const months: { month: string; key: string; revenue: number; orders: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      const yearMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        month: mName,
        key: yearMonthKey,
        revenue: 0,
        orders: 0,
      });
    }

    // Populate actual order revenues
    validOrders.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      if (!isNaN(orderDate.getTime())) {
        const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        const slot = months.find((m) => m.key === key);
        if (slot) {
          slot.revenue += o.totalAmount;
          slot.orders += 1;
        }
      }
    });

    // 2. Compute category sales from order items
    const catTotals: Record<string, number> = {
      monitors: 0,
      laptops: 0,
      ssds: 0,
      accessories: 0,
    };

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.category?.toLowerCase() || 'accessories';
        const itemRev = item.price * item.quantity;
        if (catTotals[cat] !== undefined) {
          catTotals[cat] += itemRev;
        } else {
          catTotals['accessories'] += itemRev;
        }
      });
    });

    const totalCatSales = Object.values(catTotals).reduce((a, b) => a + b, 0);

    const categories = [
      {
        name: '4K & OLED Monitors',
        share: totalCatSales > 0 ? `${Math.round((catTotals.monitors / totalCatSales) * 100)}%` : '0%',
        revenue: `₹${catTotals.monitors.toLocaleString('en-IN')}`,
        pct: totalCatSales > 0 ? (catTotals.monitors / totalCatSales) * 100 : 0,
        color: 'bg-brand-500',
        icon: Monitor,
      },
      {
        name: 'Laptops & Workstations',
        share: totalCatSales > 0 ? `${Math.round((catTotals.laptops / totalCatSales) * 100)}%` : '0%',
        revenue: `₹${catTotals.laptops.toLocaleString('en-IN')}`,
        pct: totalCatSales > 0 ? (catTotals.laptops / totalCatSales) * 100 : 0,
        color: 'bg-amber-500',
        icon: Laptop,
      },
      {
        name: 'SSDs & Storage (NVMe)',
        share: totalCatSales > 0 ? `${Math.round((catTotals.ssds / totalCatSales) * 100)}%` : '0%',
        revenue: `₹${catTotals.ssds.toLocaleString('en-IN')}`,
        pct: totalCatSales > 0 ? (catTotals.ssds / totalCatSales) * 100 : 0,
        color: 'bg-emerald-500',
        icon: HardDrive,
      },
      {
        name: 'Accessories & Docks',
        share: totalCatSales > 0 ? `${Math.round((catTotals.accessories / totalCatSales) * 100)}%` : '0%',
        revenue: `₹${catTotals.accessories.toLocaleString('en-IN')}`,
        pct: totalCatSales > 0 ? (catTotals.accessories / totalCatSales) * 100 : 0,
        color: 'bg-indigo-500',
        icon: Keyboard,
      },
    ];

    const computedMax = Math.max(...months.map((m) => m.revenue), 1000);

    return {
      periodData: months,
      categoryBreakdown: categories,
      maxRevenue: computedMax,
    };
  }, [orders]);

  const hasSales = orders.some((o) => o.status !== 'cancelled' && o.totalAmount > 0);

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
      <div className="h-64 flex items-end gap-2 sm:gap-4 pt-8 pb-2 border-b border-slate-100 relative">
        {!hasSales && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pb-6 pointer-events-none">
            <div className="text-xs font-bold text-slate-400">No revenue data recorded yet</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Bars will reflect live revenue once customers order your hardware.</div>
          </div>
        )}
        {periodData.map((item, idx) => {
          const heightPercent = hasSales && item.revenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 4) : 2;
          const isLatest = idx === periodData.length - 1;
          return (
            <div key={item.key} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                ₹{item.revenue.toLocaleString('en-IN')} ({item.orders} orders)
              </div>

              {/* Bar */}
              <div
                className={`w-full rounded-t-xl transition-all duration-500 ${
                  hasSales && item.revenue > 0
                    ? isLatest
                      ? 'bg-gradient-to-t from-brand-600 to-amber-500 shadow-md shadow-brand-500/30'
                      : 'bg-brand-500 group-hover:bg-brand-600'
                    : 'bg-slate-100 group-hover:bg-slate-200'
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
          <span className="text-slate-500">
            Total: ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Multi-color Progress bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          {categoryBreakdown.map((cat) =>
            cat.pct > 0 ? (
              <div
                key={cat.name}
                className={`${cat.color} h-full`}
                style={{ width: `${cat.pct}%` }}
                title={`${cat.name} (${cat.share})`}
              />
            ) : null
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {categoryBreakdown.map((cat) => {
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
