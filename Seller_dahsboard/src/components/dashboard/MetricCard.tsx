'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  isPositive?: boolean;
  isAlert?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  isAlert = false,
  icon: Icon,
  iconBgColor = 'bg-orange-50',
  iconColor = 'text-brand-600',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-11 h-11 rounded-2xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {value}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{subtitle}</span>
          {change && (
            <div
              className={`flex items-center space-x-1 font-bold ${
                isAlert
                  ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full'
                  : isPositive
                  ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'
                  : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full'
              }`}
            >
              {isAlert ? (
                <AlertTriangle className="w-3 h-3" />
              ) : isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
