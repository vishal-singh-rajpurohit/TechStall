'use client';

import React, { useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Store,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Cpu,
  MapPin,
  Loader2,
} from 'lucide-react';
import { sellerAuthAPI } from '@/lib/api';

function SellerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regShopName, setRegShopName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Bengaluru');
  const [regState, setRegState] = useState('Karnataka');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await signIn('credentials', {
        email: loginEmail.trim(),
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.toLowerCase().includes('fetch failed') || res.error.toLowerCase().includes('unreachable')) {
          setError('Backend API service unreachable. Please ensure the backend server is running.');
        } else {
          setError(res.error || 'Invalid merchant credentials. Please check your email and password.');
        }
      } else {
        try {
          const session = await getSession();
          if ((session as any)?.accessToken) {
            localStorage.setItem('seller_token', (session as any).accessToken);
          }
        } catch {
          // fallback
        }
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      setLoading(false);
      return;
    }

    try {
      // 1. Call Backend Seller Register
      const regRes = await sellerAuthAPI.register({
        name: regShopName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        conform_password: regConfirmPassword,
        mobile_number: regPhone.trim() || '9876543210',
        city: regCity,
        state: regState,
      });

      setSuccessMsg('Seller account registered successfully! Signing in...');

      // 2. Automatically sign in with NextAuth Credentials
      const loginRes = await signIn('credentials', {
        email: regEmail.trim(),
        password: regPassword,
        redirect: false,
      });

      if (loginRes?.error) {
        setError('Account created! Please enter your password to sign in.');
        setMode('login');
        setLoginEmail(regEmail);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email or shop name may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1F3A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#2563EB]/15 via-[#FF6B1A]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-2.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B1A] to-[#FF8C42] flex items-center justify-center text-white shadow-lg shadow-[#FF6B1A]/25">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-white">Tech</span>
              <span className="text-2xl font-black tracking-tight text-[#FF6B1A]">Stall</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
              Merchant Portal
            </span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-black tracking-tight text-white">
          {mode === 'login' ? 'Merchant Portal Sign In' : 'Register New Hardware Store'}
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          {mode === 'login'
            ? 'Manage computer accessories, warehouse inventory, and customer fulfillment'
            : 'Sell high-performance displays, SSDs, laptops and computer accessories'}
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 flex bg-[#071527] p-1 rounded-2xl border border-[#122B4F] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Merchant
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#071527] backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-[#122B4F] text-xs text-slate-300">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 text-red-200 rounded-2xl flex items-center space-x-2.5 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 rounded-2xl flex items-center space-x-2.5 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Merchant Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="merchant@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF6B1A] hover:bg-[#E05609] text-white font-black rounded-xl shadow-lg shadow-[#FF6B1A]/25 flex items-center justify-center space-x-2 text-xs transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Merchant Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Shop / Store Name
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regShopName}
                    onChange={(e) => setRegShopName(e.target.value)}
                    placeholder="e.g. Apex Hardware Store"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sales@apexhardware.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Mobile / Hotline
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0B1F3A] border border-[#122B4F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF6B1A] hover:bg-[#E05609] text-white font-black rounded-xl shadow-lg shadow-[#FF6B1A]/25 flex items-center justify-center space-x-2 text-xs transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Creating Store Account...' : 'Complete Merchant Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Merchant Security</span>
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 font-bold transition-colors"
            >
              Customer Storefront &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-xs space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <span className="font-bold tracking-wide">Loading TechStall Merchant Portal...</span>
        </div>
      }
    >
      <SellerLoginForm />
    </Suspense>
  );
}
