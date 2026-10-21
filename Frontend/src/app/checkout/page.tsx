'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  PackageCheck,
  ChevronRight,
  Zap,
  Smartphone,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { orderAPI } from '@/lib/api';
import { launchRazorpayPayment, loadRazorpayScript, getRazorpayKey } from '@/lib/razorpay';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, shipping, total, formatPrice, clearCart } = useCart();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Pre-load Razorpay Checkout SDK on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId?: string;
    orderId?: string;
    signature?: string;
  } | null>(null);

  // Auto-fill user name if session loads
  useEffect(() => {
    if (session?.user?.name && !fullName) {
      setFullName(session.user.name);
    }
  }, [session, fullName]);

  // Loading Session Skeleton
  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying secure customer session...</p>
      </div>
    );
  }

  // Not authenticated fallback
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-sm text-slate-600">
          You must be logged in with a verified customer account to access checkout and purchase products.
        </p>
        <Link
          href="/auth/signin?callbackUrl=/checkout"
          className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg transition-colors text-sm"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  // Order Success Screen
  if (placedOrder) {
    const isRazorpay = paymentMethod === 'razorpay' || placedOrder.isVerified;

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          {isRazorpay ? 'Razorpay Verified Payment' : 'Order Placed (Cash on Delivery)'}
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          Thank you, <strong>{fullName || session?.user?.name || 'Valued Customer'}</strong>! Your order has been placed in our database and routed to fulfillment.
        </p>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 text-left space-y-4 mb-8 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
              <p className="text-sm font-mono font-bold text-slate-900">
                #{placedOrder.id ? String(placedOrder.id).slice(0, 8).toUpperCase() : 'ORD-COMPLETED'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Paid</span>
              <p className="text-base font-extrabold text-brand-600">
                {formatPrice(placedOrder.total || total)}
              </p>
            </div>
          </div>

          {/* Payment gateway receipt details */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Gateway:</span>
              <span className="font-semibold text-slate-800">
                {isRazorpay ? 'Razorpay Standard Checkout' : 'Pay on Delivery'}
              </span>
            </div>
            {paymentDetails?.paymentId && (
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Payment ID:</span>
                <span className="font-bold text-emerald-600">{paymentDetails.paymentId}</span>
              </div>
            )}
            {paymentDetails?.orderId && (
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Razorpay Order ID:</span>
                <span className="text-slate-700">{paymentDetails.orderId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-600">
                {placedOrder.isVerified ? 'VERIFIED & PAID' : 'PENDING FULFILLMENT'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-600 pt-1">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Shipping to:</p>
              <p>{address}, {city}, {state} - {pinCode}</p>
              <p className="mt-0.5 text-slate-500">Contact: +91 {mobileNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-emerald-700 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Estimated Delivery: Within 2–4 business days via Express Priority Courier.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/orders"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0B1F3A] hover:bg-[#122B4F] text-white font-bold rounded-2xl text-sm transition-colors flex items-center justify-center space-x-2 shadow-md shadow-[#0B1F3A]/20"
          >
            <PackageCheck className="w-4 h-4" />
            <span>View All My Orders</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#FF6B1A] hover:bg-[#E05609] text-white font-bold rounded-2xl text-sm transition-colors flex items-center justify-center space-x-2 shadow-md shadow-[#FF6B1A]/20"
          >
            <span>Continue Shopping</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Empty Cart Screen
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500">
          You don&apos;t have any products in your cart to checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-sm transition-colors"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  // Handle Order Submit & Razorpay Integration
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim() || !city.trim() || !pinCode.trim() || !mobileNumber.trim()) {
      setError('Please fill in all mandatory delivery address fields.');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^\d{6}$/.test(pinCode.trim())) {
      setError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Place order in backend
      const payload = {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pin_code: pinCode.trim(),
        mobile_number: mobileNumber.trim(),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await orderAPI.placeOrder(payload);

      if (paymentMethod === 'razorpay') {
        // 2. Launch Razorpay payment modal
        await launchRazorpayPayment({
          orderId: res.id,
          razorpayOrderId: res.payment?.razorpay_order_id,
          amount: res.total || total,
          currency: 'INR',
          customer: {
            name: fullName || session?.user?.name,
            email: session?.user?.email,
            contact: mobileNumber,
          },
          address: `${address}, ${city}, ${state} - ${pinCode}`,
          onSuccess: async (rzpRes) => {
            try {
              // 3. Verify Razorpay payment on backend
              const verified = await orderAPI.verifyOrder(
                res.id,
                rzpRes.razorpay_payment_id,
                rzpRes.razorpay_signature,
                rzpRes.razorpay_order_id
              );
              setPlacedOrder(verified || res);
              setPaymentDetails({
                paymentId: rzpRes.razorpay_payment_id,
                orderId: rzpRes.razorpay_order_id,
                signature: rzpRes.razorpay_signature,
              });
              clearCart();
            } catch (vErr: any) {
              setError(vErr.message || 'Payment completed, but verification timed out. Your order is logged in My Orders.');
            } finally {
              setLoading(false);
            }
          },
          onDismiss: () => {
            setLoading(false);
            setError(
              `Payment window closed. Your order #${String(res.id).slice(0, 8).toUpperCase()} was saved as Pending. You can complete payment anytime from the My Orders page.`
            );
          },
          onError: (pErr) => {
            setLoading(false);
            setError(pErr?.message || 'Razorpay payment could not be processed. Please try again.');
          },
        });
      } else {
        // Cash on delivery
        setPlacedOrder(res);
        clearCart();
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb & Title */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Checkout</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout &amp; Place Order
          </h1>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate max-w-xs">Logged in as {session?.user?.name || session?.user?.email}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shipping & Payment Information */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Contact */}
          <div className="bg-white p-4 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-[#0B1F3A] font-bold text-base pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-[#2563EB]" />
              <h2>1. Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-[#DC2626]">* (10 digits)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="bg-white p-4 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-[#0B1F3A] font-bold text-base pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-[#2563EB]" />
              <h2>2. Shipping Address</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Street Address, Flat / House No. <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Flat 302, Palm Heights, Main MG Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PIN Code <span className="text-[#DC2626]">* (6 digits)</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="560001"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave with security / Call upon arrival"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Section 3: Payment Method (Razorpay vs COD) */}
          <div className="bg-white p-4 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-[#0B1F3A] font-bold text-base">
                <CreditCard className="w-5 h-5 text-[#2563EB]" />
                <h2>3. Payment Method</h2>
              </div>
              <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#2563EB]" />
                <span>256-Bit Razorpay SSL</span>
              </span>
            </div>

            <div className="space-y-3">
              {/* Option A: Razorpay Standard Checkout */}
              <label
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#2563EB] bg-[#EFF6FF]/60 ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-black text-xs">
                        R
                      </div>
                      <span className="font-bold text-sm text-[#0B1F3A]">
                        Razorpay Secure Checkout
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#2563EB] text-white px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Pay securely with <strong>UPI (Google Pay, PhonePe, Paytm)</strong>, <strong>Credit/Debit Cards (Visa, Mastercard, RuPay)</strong>, <strong>NetBanking (50+ banks)</strong>, or <strong>Wallets</strong>.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-blue-100 text-[10px] font-bold text-slate-500">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">UPI</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">Cards</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">NetBanking</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">Wallets</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">Instant Refund</span>
                  </div>
                </div>
              </label>

              {/* Option B: Cash on Delivery */}
              <label
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
                  paymentMethod === 'cod'
                    ? 'border-[#0B1F3A] bg-slate-50 ring-2 ring-[#0B1F3A]/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#0B1F3A] focus:ring-[#0B1F3A]"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-5 h-5 text-[#16A34A]" />
                    <span className="font-bold text-sm text-[#0B1F3A]">Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Pay in cash or via UPI QR scan directly to the delivery agent upon product arrival at your door.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-4 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 sticky top-28">
            <h2 className="text-lg font-bold text-[#0B1F3A] pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full font-bold border border-[#DBEAFE]">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </h2>

            {/* Items list */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="relative w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-200/60">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.product.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900 shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="font-semibold text-[#16A34A]">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">{formatPrice(shipping)}</span>
                )}
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 text-slate-900">
                <span className="text-sm font-bold">Total Amount</span>
                <span className="text-xl font-black text-[#FF6B1A]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider text-white bg-[#FF6B1A] hover:bg-[#E05609] shadow-[#FF6B1A]/25 disabled:bg-slate-400"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing with Razorpay...</span>
                </>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay with Razorpay • {formatPrice(total)}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Place COD Order • {formatPrice(total)}</span>
                </>
              )}
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Razorpay 256-Bit SSL • 100% Genuine Certified Hardware</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
