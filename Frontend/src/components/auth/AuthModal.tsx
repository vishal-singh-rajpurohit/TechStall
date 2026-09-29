'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

import { userAuthAPI } from '@/lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (tab === 'register') {
        // Call backend register
        const res = await userAuthAPI.register({
          first_name: name || email.split('@')[0],
          email,
          mobile_number: mobile || `9${Math.floor(100000000 + Math.random() * 900000000)}`,
          password,
        });
        if (res.access_token && typeof window !== 'undefined') {
          localStorage.setItem('access_token', res.access_token);
        }
        setSuccessMsg('Account created successfully! Signing in...');
      }

      // Sign in via NextAuth
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError('Login failed. Please verify your email and password.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {tab === 'signin' ? 'Welcome to TechStall' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'signin'
              ? 'Sign in to manage orders, wishlist & fast checkout'
              : 'Join to order computer accessories with fast checkout'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
          >
            {loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          By continuing, you agree to TechStall Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
