'use client';

import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  Filter,
  Download,
} from 'lucide-react';
import { useSeller } from '@/context/SellerContext';
import { SellerOrder, OrderStatus } from '@/types/seller';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';

export default function OrdersManagementPage() {
  const { orders } = useSeller();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);

  const statusBadges: Record<OrderStatus, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    processing: { label: 'Processing', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    shipped: { label: 'Shipped', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    delivered: { label: 'Delivered', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Cancelled', class: 'bg-red-50 text-red-700 border-red-200' },
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track customer shipments, assign courier tracking numbers, and fulfill computer accessories.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, customer name, tracking..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Pipeline Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'processing' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Processing ({counts.processing})
            </button>
            <button
              onClick={() => setActiveTab('shipped')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'shipped' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Shipped ({counts.shipped})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'delivered' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Delivered ({counts.delivered})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'cancelled' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Cancelled ({counts.cancelled})
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No customer orders found for this view.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = statusBadges[ord.status];
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700">
                          {ord.items.reduce((s, i) => s + i.quantity, 0)} items
                        </span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {ord.items.map((i) => i.productTitle).join(', ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{ord.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.trackingNumber ? (
                          <span className="font-mono text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                            {ord.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.class}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Fulfill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
