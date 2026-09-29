import { SellerProduct, SellerOrder, CustomerReview, StoreSettings } from '@/types/seller';

// Clean initial state without dummy sandbox datasets
export const initialProducts: SellerProduct[] = [];

export const initialOrders: SellerOrder[] = [];

export const initialReviews: CustomerReview[] = [];

export const initialStoreSettings: StoreSettings = {
  storeName: 'TechStall Official Hardware Hub',
  storeTagline: 'Certified high-performance computer hardware, displays & NVMe storage',
  merchantEmail: 'seller@techgear.io',
  supportPhone: '+91 98765 43210',
  returnPolicyDays: 30,
  lowStockAlertThreshold: 5,
  autoNotifyNewOrders: true,
  autoNotifyLowStock: true,
  currency: 'INR (₹)',
  bankAccount: {
    bankName: 'HDFC Bank Ltd',
    accountNumber: '**** **** 4590',
    routingNumber: 'HDFC0001234',
  },
};
