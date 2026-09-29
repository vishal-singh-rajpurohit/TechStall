'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Truck, CheckCircle2, Clock, Printer, User, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
import { SellerOrder, OrderStatus } from '@/types/seller';
import { useSeller } from '@/context/SellerContext';

interface OrderDetailsModalProps {
  order: SellerOrder | null;
  onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const { updateOrderStatus } = useSeller();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status || 'pending');
  const [carrier, setCarrier] = useState(order?.carrier || 'FedEx Express');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleApplyStatus = () => {
    setIsUpdating(true);
    updateOrderStatus(order.id, selectedStatus, carrier, trackingNumber);
    setTimeout(() => {
      setIsUpdating(false);
      onClose();
    }, 400);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Fulfillment Order
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{order.orderNumber}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintSlip}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Print Packing Slip"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Customer Details
              </span>
              <div className="space-y-1.5 text-slate-700 font-medium">
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-900">{order.customerName}</strong>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customerEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Shipping Destination
              </span>
              <div className="flex items-start space-x-2 text-slate-700 font-medium leading-relaxed">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>{order.shippingAddress}</span>
              </div>
            </div>
          </div>

          {/* Ordered Hardware Items */}
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
              Hardware Line Items ({order.items.length})
            </span>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-200/60">
                      <Image src={item.image} alt={item.productTitle} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate max-w-sm">{item.productTitle}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.quantity} × ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl mt-3 space-y-1.5 border border-slate-200/60">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping ({order.shippingFee === 0 ? 'FREE Express' : 'Standard'})</span>
                <span className="font-semibold">₹{order.shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount Paid</span>
                <span className="text-brand-600">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Status Workflow Controller */}
          <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-slate-900 uppercase">
                Update Order Status &amp; Dispatch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fulfillment Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="pending">Pending Review</option>
                  <option value="processing">Processing &amp; Packaging</option>
                  <option value="shipped">Shipped (Dispatched)</option>
                  <option value="delivered">Delivered to Customer</option>
                  <option value="cancelled">Cancelled &amp; Refunded</option>
                </select>
              </div>

              {(selectedStatus === 'shipped' || order.trackingNumber) && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Carrier</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="FedEx, DHL, UPS"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Shipment Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. FDX-889102931"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleApplyStatus}
              disabled={isUpdating}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUpdating ? 'Saving Update...' : 'Save & Notify Customer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
