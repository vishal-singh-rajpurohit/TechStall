'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, CreditCard, Bell, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';

export default function StoreSettingsPage() {
  const { settings, updateSettings, resetToDefaults } = useSeller();

  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Merchant Store Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure hardware store profile, payout banking details, and automated notification triggers.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Store settings have been saved and synced to your merchant account.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Store Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Store Profile &amp; Branding</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Store Name</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Merchant Email</label>
              <input
                type="email"
                required
                value={formData.merchantEmail}
                onChange={(e) => setFormData({ ...formData, merchantEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Store Tagline</label>
              <input
                type="text"
                value={formData.storeTagline}
                onChange={(e) => setFormData({ ...formData, storeTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Hotline Support Phone</label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Store Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Return Window (Days)</label>
              <input
                type="number"
                value={formData.returnPolicyDays}
                onChange={(e) => setFormData({ ...formData, returnPolicyDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Payout Banking Account */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Payout &amp; Settlement Account</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankAccount.bankName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankAccount: { ...formData.bankAccount, bankName: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccount.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankAccount: { ...formData.bankAccount, accountNumber: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Automated Notifications */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Automated Notification Rules</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Instant Order Alert</span>
                <span className="text-[11px] text-slate-500">
                  Receive an email as soon as a customer orders hardware.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.autoNotifyNewOrders}
                onChange={(e) => setFormData({ ...formData, autoNotifyNewOrders: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Low Inventory Warning</span>
                <span className="text-[11px] text-slate-500">
                  Trigger alerts when any SKU drops below 5 units.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.autoNotifyLowStock}
                onChange={(e) => setFormData({ ...formData, autoNotifyLowStock: e.target.checked })}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-slate-300"
              />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Store Cache</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-brand-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
