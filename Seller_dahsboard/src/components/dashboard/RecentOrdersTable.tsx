'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';
import { OrderStatus } from '@/types/seller';

export function RecentOrdersTable() {
  const { orders, updateOrderStatus } = useSeller();

  const statusBadges: Record<OrderStatus, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    processing: { label: 'Processing', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    shipped: { label: 'Shipped', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    delivered: { label: 'Delivered', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Cancelled', class: 'bg-red-50 text-red-700 border-red-200' },
  };

  const recent = orders.slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Fulfillment Feed</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Orders</h3>
        </div>
        <Link
          href="/orders"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
        >
          <span>View All Pipeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-3">Order</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Hardware Items</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map((order) => {
              const badge = statusBadges[order.status];
              return (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    <Link href="/orders" className="hover:text-brand-600">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{order.customerName}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">
                    {order.items.map((i) => `${i.quantity}x ${i.productTitle}`).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.class}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {order.status === 'pending' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Accept Order
                      </button>
                    ) : order.status === 'processing' ? (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'shipped',
                            'FedEx Express',
                            `FDX-${Math.floor(10000000 + Math.random() * 90000000)}`
                          )
                        }
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Dispatch &amp; Track
                      </button>
                    ) : (
                      <Link
                        href="/orders"
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
