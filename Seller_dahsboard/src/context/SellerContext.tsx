'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  SellerProduct,
  SellerOrder,
  CustomerReview,
  StoreSettings,
  OrderStatus,
  HardwareCategory,
} from '@/types/seller';
import {
  initialProducts,
  initialOrders,
  initialReviews,
  initialStoreSettings,
} from '@/data/initialSellerData';
import { sellerAuthAPI, sellerProductAPI, sellerOrderAPI } from '@/lib/api';

interface SellerContextType {
  products: SellerProduct[];
  orders: SellerOrder[];
  reviews: CustomerReview[];
  settings: StoreSettings;
  addProduct: (product: Omit<SellerProduct, 'id' | 'createdAt' | 'salesCount'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<SellerProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  restockProduct: (id: string, amount: number) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    carrier?: string,
    trackingNumber?: string
  ) => Promise<void>;
  replyToReview: (reviewId: string, reply: string) => void;
  updateReviewStatus: (reviewId: string, status: 'published' | 'pending' | 'flagged') => void;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  resetToDefaults: () => void;
  refreshFromBackend: (tokenOverride?: string) => Promise<void>;
  isApiConnected: boolean;
  isLoading: boolean;
  // Computed KPIs
  totalRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
  processingOrdersCount: number;
  lowStockCount: number;
  averageOrderValue: number;
  totalProductsCount: number;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

const STORAGE_KEY = 'techstall_seller_dashboard_state_v4';

function mapBackendProductToSeller(bp: any): SellerProduct {
  const images = Array.isArray(bp.images) && bp.images.length > 0
    ? bp.images
    : ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'];
  let specs: Record<string, string> = {};
  try {
    specs = typeof bp.specifications === 'string' ? JSON.parse(bp.specifications) : (bp.specifications || {});
  } catch {
    specs = {};
  }
  const rawCat = (bp.category || 'monitors').toLowerCase();
  const category: HardwareCategory = ['monitors', 'laptops', 'ssds', 'accessories'].includes(rawCat)
    ? (rawCat as HardwareCategory)
    : 'accessories';

  const price = bp.selling_price || bp.price || 999;
  const originalPrice = bp.price || bp.selling_price || 999;

  return {
    id: String(bp.id),
    sku: bp.sku || `SKU-${String(bp.id).slice(0, 6)}`,
    title: bp.title,
    brand: bp.brand || 'QuantumTech',
    category,
    categoryLabel: category.charAt(0).toUpperCase() + category.slice(1),
    price,
    costPrice: Math.round(price * 0.7),
    originalPrice,
    stockQuantity: bp.stock ?? 10,
    lowStockThreshold: 5,
    rating: 4.8,
    reviewsCount: 14,
    images,
    videos: Array.isArray(bp.videos) ? bp.videos : [],
    media: Array.isArray(bp.media) ? bp.media : [],
    description: Array.isArray(bp.description) ? bp.description.join(', ') : (bp.description || bp.title),
    specifications: specs,
    status: bp.isActive !== false ? 'active' : 'draft',
    createdAt: bp.created_at ? bp.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    salesCount: 4,
  };
}

function mapBackendOrderToSeller(bo: any): SellerOrder {
  const statusMap: Record<string, OrderStatus> = {
    CONFORMED: 'processing',
    CONFIRMED: 'processing',
    PENDING: 'pending',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    DELIEVERED: 'delivered',
    CANCELLED: 'cancelled',
  };

  const items = Array.isArray(bo.items)
    ? bo.items.map((item: any) => ({
        productId: String(item.productId || item.product_id || item.product?.id || 'prod-item'),
        productTitle: item.productTitle || item.product?.title || 'Hardware Product Item',
        category: (item.product?.category?.title || item.category || 'monitors').toLowerCase() as HardwareCategory,
        sku: item.sku || item.product?.sku || 'SKU-ITEM',
        quantity: item.quantity || 1,
        price: item.price || item.unitPrice || 0,
        image: item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      }))
    : [];

  const addr = [bo.address, bo.city, bo.state, bo.pin_code].filter(Boolean).join(', ') || 'Tech Blvd, Silicon Valley';
  const total = bo.total || 0;

  return {
    id: String(bo.id),
    orderNumber: bo.orderNumber || `ORD-${String(bo.id).slice(0, 8).toUpperCase()}`,
    customerName: bo.user?.name || bo.customerName || 'Verified Tech Customer',
    customerEmail: bo.user?.email || bo.customerEmail || 'customer@techgear.io',
    customerPhone: bo.mobile_number || bo.user?.mobile_number || '9876543210',
    shippingAddress: addr,
    items,
    subtotal: total > 20 ? total - 15 : total,
    shippingFee: total > 150 ? 0 : 15,
    totalAmount: total,
    status: statusMap[bo.status] || 'processing',
    paymentMethod: bo.payments?.[0]?.razorpay_payment_id ? 'Razorpay / Prepaid' : 'Prepaid Card',
    paymentStatus: bo.payments && bo.payments.some((p: any) => p.status === 'SUCCESS') ? 'paid' : (bo.isVerified ? 'paid' : 'pending'),
    trackingNumber: bo.tracking_number || `TRK-${String(bo.id).slice(0, 8).toUpperCase()}`,
    carrier: bo.shipping_carrier || 'DHL Express Global',
    createdAt: bo.created_at || new Date().toISOString(),
    updatedAt: bo.updated_at || new Date().toISOString(),
  };
}

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<SellerProduct[]>(initialProducts);
  const [orders, setOrders] = useState<SellerOrder[]>(initialOrders);
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate and fetch from backend using current session token
  const refreshFromBackend = useCallback(async (tokenOverride?: string) => {
    setIsLoading(true);
    try {
      const activeToken =
        tokenOverride ||
        (session as any)?.accessToken ||
        (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);

      if (activeToken && typeof window !== 'undefined') {
        localStorage.setItem('seller_token', activeToken);
      }

      // 1. Fetch live products from backend
      const rawProducts = await sellerProductAPI.getProducts(undefined, activeToken || undefined);
      if (Array.isArray(rawProducts)) {
        const liveProducts = rawProducts.map(mapBackendProductToSeller);
        setProducts(liveProducts);
        setIsApiConnected(true);
      }

      // 2. Fetch live orders from backend
      const rawOrders = await sellerOrderAPI.getOrders(activeToken || undefined);
      if (Array.isArray(rawOrders)) {
        const liveOrders = rawOrders.map(mapBackendOrderToSeller);
        setOrders(liveOrders);
        setIsApiConnected(true);
      }
    } catch (err) {
      console.warn('Backend live sync notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Load local state & trigger backend sync on mount
  useEffect(() => {
    try {
      // Clean up legacy mock data storage keys
      if (typeof window !== 'undefined') {
        localStorage.removeItem('techstall_seller_dashboard_state_v2');
        localStorage.removeItem('techstall_seller_dashboard_state_v3');
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.error('Failed to load seller state from localStorage', e);
    } finally {
      setIsLoaded(true);
    }

    refreshFromBackend();
  }, [refreshFromBackend]);

  // Trigger backend refresh when user logs in with NextAuth & update store identity
  useEffect(() => {
    if (session) {
      const shopName = (session.user as any)?.shopName || session.user?.name;
      const email = session.user?.email;
      if (shopName || email) {
        setSettings((prev) => ({
          ...prev,
          storeName: shopName || prev.storeName,
          merchantEmail: email || prev.merchantEmail,
        }));
      }

      if ((session as any).accessToken) {
        const token = (session as any).accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('seller_token', token);
        }
        refreshFromBackend(token);
      }
    }
  }, [session, refreshFromBackend]);

  // Persist state to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = { products, orders, reviews, settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save seller state to localStorage', e);
    }
  }, [products, orders, reviews, settings, isLoaded]);

  // Product CRUD with live API backend calls
  const addProduct = async (productData: Omit<SellerProduct, 'id' | 'createdAt' | 'salesCount'>) => {
    // 1. Optimistic UI update
    const tempId = `prod-${Date.now()}`;
    const newProduct: SellerProduct = {
      ...productData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
      salesCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);

    // 2. Call backend API with session token
    const activeToken =
      (session as any)?.accessToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);

    try {
      const res = await sellerProductAPI.createProduct({
        title: productData.title,
        price: productData.originalPrice || productData.price,
        selling_price: productData.price,
        stock: productData.stockQuantity,
        brand: productData.brand,
        sku: productData.sku,
        category_title: productData.category,
        images: productData.images,
        videos: productData.videos,
        media: productData.media,
        specifications: productData.specifications,
        description: productData.description,
      }, activeToken || undefined);

      if (res?.id || res?.product_id) {
        const confirmedId = String(res.id || res.product_id);
        setProducts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: confirmedId } : p))
        );
      }
    } catch (err) {
      console.warn('Backend product creation error, persisted locally:', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<SellerProduct>) => {
    // 1. Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // 2. Call backend API with session token
    const activeToken =
      (session as any)?.accessToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);

    try {
      await sellerProductAPI.modifyProduct({
        product_id: id,
        title: updates.title,
        price: updates.originalPrice,
        selling_price: updates.price,
        stock: updates.stockQuantity,
        brand: updates.brand,
        sku: updates.sku,
        category: updates.category,
        images: updates.images,
        videos: updates.videos,
        media: updates.media,
        specifications: updates.specifications,
        description: updates.description,
      }, activeToken || undefined);
    } catch (err) {
      console.warn('Backend product update error, persisted locally:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    const activeToken =
      (session as any)?.accessToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);

    try {
      await sellerProductAPI.deleteProduct(id, activeToken || undefined);
    } catch (err) {
      console.warn('Backend product delete error, removed locally:', err);
    }
  };

  const restockProduct = async (id: string, amount: number) => {
    let newStock = 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          newStock = p.stockQuantity + amount;
          return { ...p, stockQuantity: newStock };
        }
        return p;
      })
    );

    const activeToken =
      (session as any)?.accessToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);

    try {
      await sellerProductAPI.changeStock(id, newStock, activeToken || undefined);
    } catch (err) {
      console.warn('Backend change stock error, restocked locally:', err);
    }
  };

  // Order workflow with live API backend calls
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    carrier?: string,
    trackingNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            carrier: carrier || ord.carrier,
            trackingNumber: trackingNumber || ord.trackingNumber,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    const reverseStatusMap: Record<OrderStatus, string> = {
      pending: 'PENDING',
      processing: 'CONFORMED',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
    };

    try {
      const activeToken =
        (session as any)?.accessToken ||
        (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);

      await sellerOrderAPI.changeOrderStatus(
        orderId,
        reverseStatusMap[status] || status.toUpperCase(),
        {
          shipping_carrier: carrier,
          tracking_number: trackingNumber,
        },
        activeToken || undefined
      );
    } catch (err) {
      console.warn('Backend order status update error, updated locally:', err);
    }
  };

  // Review interactions
  const replyToReview = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, sellerReply: reply } : r))
    );
  };

  const updateReviewStatus = (reviewId: string, status: 'published' | 'pending' | 'flagged') => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
  };

  // Settings
  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setProducts(initialProducts);
    setOrders(initialOrders);
    setReviews(initialReviews);
    setSettings(initialStoreSettings);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Calculations
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const processingOrdersCount = orders.filter((o) => o.status === 'processing').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const totalProductsCount = products.length;

  return (
    <SellerContext.Provider
      value={{
        products,
        orders,
        reviews,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        updateOrderStatus,
        replyToReview,
        updateReviewStatus,
        updateSettings,
        resetToDefaults,
        refreshFromBackend,
        isApiConnected,
        isLoading,
        totalRevenue,
        totalOrders,
        pendingOrdersCount,
        processingOrdersCount,
        lowStockCount,
        averageOrderValue,
        totalProductsCount,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
}
