'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { useSeller } from '@/context/SellerContext';
import { SellerProduct } from '@/types/seller';
import { QuickRestockModal } from '@/components/inventory/QuickRestockModal';

export default function InventoryHealthPage() {
  const { products, restockProduct } = useSeller();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [selectedRestockProduct, setSelectedRestockProduct] = useState<SellerProduct | null>(null);

  const lowStockItems = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0
  );
  const outOfStockItems = products.filter((p) => p.stockQuantity === 0);
  const healthyItems = products.filter((p) => p.stockQuantity > p.lowStockThreshold);

  const totalWarehouseUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);

  const displayedProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === 'low') return matchesSearch && p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
    if (filterMode === 'out') return matchesSearch && p.stockQuantity === 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Warehouse &amp; Inventory Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor safe stock thresholds, prevent backorders, and execute batch replenishment.
        </p>
      </div>

      {/* 4 Health Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Units</span>
            <div className="text-2xl font-black text-slate-900">{totalWarehouseUnits}</div>
            <span className="text-[10px] text-slate-500">Across {products.length} SKUs</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Healthy Stock</span>
            <div className="text-2xl font-black text-emerald-600">{healthyItems.length}</div>
            <span className="text-[10px] text-slate-500">&gt; Safe threshold</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Low Stock</span>
            <div className="text-2xl font-black text-amber-600">{lowStockItems.length}</div>
            <span className="text-[10px] text-slate-500">Reorder recommended</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Out of Stock</span>
            <div className="text-2xl font-black text-red-600">{outOfStockItems.length}</div>
            <span className="text-[10px] text-slate-500">Immediate action</span>
          </div>
        </div>
      </div>

      {/* Critical Reorder Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-red-600 to-amber-600 text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-black text-sm">Critical Stock Alert: {lowStockItems.length} Items Below Minimum</h4>
              <p className="text-xs text-orange-100">
                Monitors and PCIe Gen5 SSDs risk running out within the next 48 hours.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterMode('low')}
            className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors shrink-0 shadow-sm"
          >
            Review Low SKUs
          </button>
        </div>
      )}

      {/* Inventory Search & Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search warehouse SKUs..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            All Inventory
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'low' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Low Stock ({lowStockItems.length})
          </button>
          <button
            onClick={() => setFilterMode('out')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'out' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Out of Stock ({outOfStockItems.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4">Hardware Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Reorder Threshold</th>
                <th className="py-3.5 px-4">Inventory Health</th>
                <th className="py-3.5 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedProducts.map((p) => {
                const isLow = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
                const isOut = p.stockQuantity === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                          <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <h4 className="font-bold text-slate-900 truncate">{p.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            SKU: {p.sku} • {p.brand}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 uppercase text-[10px]">
                        {p.categoryLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      {p.stockQuantity} units
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      {p.lowStockThreshold} units
                    </td>

                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Low Stock Alert</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Healthy ({p.stockQuantity})
                        </span>
                      )}
                    </td>

                    {/* Instant Restock Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => restockProduct(p.id, 10)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 font-bold rounded-lg text-[10px] transition-colors"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => restockProduct(p.id, 25)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 font-bold rounded-lg text-[10px] transition-colors"
                          title="Add 25 units"
                        >
                          +25
                        </button>
                        <button
                          onClick={() => setSelectedRestockProduct(p)}
                          className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-[10px] shadow-sm transition-colors"
                        >
                          Custom...
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Restock Modal */}
      <QuickRestockModal
        product={selectedRestockProduct}
        onClose={() => setSelectedRestockProduct(null)}
      />
    </div>
  );
}
