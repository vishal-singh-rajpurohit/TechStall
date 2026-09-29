'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyRate {
  symbol: string;
  rate: number;
}

const CURRENCY_RATES: Record<Currency, CurrencyRate> = {
  INR: { symbol: '₹', rate: 1 },
  USD: { symbol: '$', rate: 0.012 },
  EUR: { symbol: '€', rate: 0.011 },
  GBP: { symbol: '£', rate: 0.0095 },
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSpec?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInUSD: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('techgear_cart');
      const savedWishlist = localStorage.getItem('techgear_wishlist');
      const savedCurrency = localStorage.getItem('techgear_currency') as Currency;

      if (savedCart) setItems(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      setCurrency('INR');
    } catch (e) {
      console.error('Error loading cart/wishlist state', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('techgear_cart', JSON.stringify(items));
      localStorage.setItem('techgear_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('techgear_currency', currency);
    } catch (e) {
      console.error('Error persisting cart state', e);
    }
  }, [items, wishlist, currency, isInitialized]);

  const addToCart = (product: Product, quantity = 1, selectedSpec?: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedSpec }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1499.00;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99.00;
  const total = subtotal + shipping;

  const formatPrice = (priceInINR: number): string => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
    const converted = priceInINR * rateObj.rate;
    if (currency === 'INR') {
      return `${rateObj.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${rateObj.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        wishlist,
        toggleWishlist,
        isWishlisted,
        totalItems,
        subtotal,
        shipping,
        total,
        freeShippingThreshold,
        currency,
        setCurrency,
        formatPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
