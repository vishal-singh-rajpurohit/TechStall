'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Boxes, CheckCircle2 } from 'lucide-react';
import { SellerProduct } from '@/types/seller';
import { useSeller } from '@/context/SellerContext';

interface QuickRestockModalProps {
  product: SellerProduct | null;
  onClose: () => void;
}

export function QuickRestockModal({ product, onClose }: QuickRestockModalProps) {
  const { restockProduct } = useSeller();
  const [amount, setAmount] = useState(25);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!product) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    restockProduct(product.id, amount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Restock Hardware Inventory</h3>
          <p className="text-xs text-slate-500 mt-1">Add replenishment units received from manufacturer</p>
        </div>

        {/* Product Card Mini */}
        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60 mb-6">
          <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/60">
            <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
            <div className="text-[10px] text-slate-400 font-mono">
              SKU: {product.sku} • Current: <strong>{product.stockQuantity} units</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Select Batch Restock Amount
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[10, 25, 50, 100].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setAmount(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    amount === num
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{num}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Custom Units:</span>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/25 transition-all flex items-center justify-center space-x-1.5"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Restocked Successfully!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Confirm +{amount} Units Received</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
