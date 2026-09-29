'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Monitor Compatibility', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
            Support &amp; Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Talk to Our Hardware Specialists
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Have questions about PCIe 5.0 compatibility, OLED burn-in warranty, or bulk office setups? We are here 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hotline Direct</h4>
                <div className="text-sm font-bold text-slate-900 mt-0.5">+880 1571 484593</div>
                <div className="text-sm font-bold text-slate-900">+1 (800) 555-TECH</div>
                <p className="text-[11px] text-slate-400 mt-1">Available 24 hours / 7 days a week</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Support</h4>
                <div className="text-sm font-bold text-slate-900 mt-0.5">support@techstall.io</div>
                <div className="text-sm font-bold text-slate-900">warranty@techstall.io</div>
                <p className="text-[11px] text-slate-400 mt-1">Average response time: &lt; 20 minutes</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Testing Lab &amp; HQ</h4>
                <div className="text-sm font-bold text-slate-900 mt-0.5">Silicon Avenue 404, Tech Park</div>
                <div className="text-sm text-slate-600">San Jose, CA 95112, United States</div>
              </div>
            </div>
          </div>

          {/* Contact Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            {submitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Thank you for reaching out. One of our hardware engineers will email you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Send an Inquiry</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Marcus Sterling"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="marcus@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    <option>4K OLED Monitor Compatibility</option>
                    <option>PCIe Gen5 SSD Motherboard Support</option>
                    <option>Laptop Custom Configuration</option>
                    <option>Warranty Claim &amp; Replacement</option>
                    <option>Bulk Order for Offices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please specify your query or hardware configuration..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Hardware Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
