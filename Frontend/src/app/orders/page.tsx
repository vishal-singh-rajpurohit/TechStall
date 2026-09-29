'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  ChevronRight,
  ShoppingBag,
  Loader2,
  MapPin,
  Lock,
  ArrowRight,
  CreditCard,
  Check,
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { launchRazorpayPayment, loadRazorpayScript } from '@/lib/razorpay';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { formatPrice } = useCart();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/orders');
    }
  }, [status, router]);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const fetchOrders = async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderAPI.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      await orderAPI.cancelOrder(orderId, 'Cancelled by customer');
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayWithRazorpay = async (order: any) => {
    setPayingOrderId(order.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await launchRazorpayPayment({
        orderId: order.id,
        razorpayOrderId: order.payment?.razorpay_order_id,
        amount: order.total,
        currency: 'INR',
        customer: {
          name: session?.user?.name,
          email: session?.user?.email,
          contact: order.mobile_number,
        },
        address: `${order.address}, ${order.city} - ${order.pin_code}`,
        onSuccess: async (rzpRes) => {
          try {
            await orderAPI.verifyOrder(
              order.id,
              rzpRes.razorpay_payment_id,
              rzpRes.razorpay_signature,
              rzpRes.razorpay_order_id
            );
            setSuccessMessage(`Payment verified successfully for Order #${String(order.id).slice(0, 8).toUpperCase()}!`);
            await fetchOrders();
          } catch (vErr: any) {
            setError(vErr.message || 'Payment received but verification check timed out.');
          } finally {
            setPayingOrderId(null);
          }
        },
        onDismiss: () => {
          setPayingOrderId(null);
        },
        onError: (pErr) => {
          setPayingOrderId(null);
          setError(pErr?.message || 'Razorpay payment could not be processed.');
        },
      });
    } catch (err: any) {
      setPayingOrderId(null);
      setError(err.message || 'Failed to initialize payment gateway.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying session & loading orders...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-sm text-slate-600">
          You must be logged in to view your order history and tracking details.
        </p>
        <Link
          href="/auth/signin?callbackUrl=/orders"
          className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg transition-colors text-sm"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">My Orders</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Orders &amp; Purchases
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track fulfillment status, Razorpay payments, delivery address, and invoices for your hardware.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="text-xs font-semibold px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors w-fit shrink-0"
          >
            Refresh
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching orders from database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Orders Placed Yet</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Looks like you haven&apos;t placed any orders yet. Discover our catalog of monitors, laptops, and hardware.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isPending = order.status === 'PENDING';
            const isDelivered = order.status === 'DELIEVERED';
            const isCancelled = order.status === 'CANCELLED';
            const isVerified = order.isVerified;

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-7 shadow-sm space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Order ID
                    </span>
                    <p className="text-sm font-mono font-bold text-slate-900">
                      #{String(order.id).slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Date Placed
                    </span>
                    <span className="text-xs text-slate-700">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }) : 'Recent'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total
                    </span>
                    <span className="text-base font-extrabold text-brand-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Payment verification tag */}
                    {isVerified ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Check className="w-3 h-3 text-blue-600" />
                        <span>Razorpay Paid</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <span>Unpaid / COD</span>
                      </span>
                    )}

                    {/* Order fulfillment status badge */}
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : isCancelled
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isDelivered && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isCancelled && <XCircle className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      <span>{order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-3">
                  {order.items?.map((it: any) => (
                    <div
                      key={it.id}
                      className="flex items-center space-x-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-100"
                    >
                      <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        {it.product?.images?.[0] ? (
                          <Image
                            src={it.product.images[0]}
                            alt={it.product.title || 'Product'}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${it.productId || it.product?.id}`}
                          className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-brand-600 line-clamp-1 transition-colors"
                        >
                          {it.product?.title || 'Certified Hardware Item'}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Quantity: {it.quantity} × {formatPrice(it.item_price || it.product?.selling_price || 0)}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {formatPrice((it.item_price || 0) * (it.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Address & Razorpay Pay Now / Cancel Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Shipping to: <strong>{order.address}, {order.city} ({order.pin_code})</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Pay with Razorpay button if order is unpaid & not cancelled */}
                    {isPending && !isVerified && (
                      <button
                        onClick={() => handlePayWithRazorpay(order)}
                        disabled={payingOrderId === order.id}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all disabled:bg-slate-300"
                      >
                        {payingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Opening Razorpay...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay with Razorpay</span>
                          </>
                        )}
                      </button>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline disabled:text-slate-400 transition-colors"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
