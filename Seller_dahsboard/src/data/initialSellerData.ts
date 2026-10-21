import { SellerProduct, SellerOrder, CustomerReview, StoreSettings } from '@/types/seller';

// Clean initial state without dummy sandbox datasets
export const initialProducts: SellerProduct[] = [];

export const initialOrders: SellerOrder[] = [];

export const initialReviews: CustomerReview[] = [];

export const initialStoreSettings: StoreSettings = {
  storeName: 'Merchant Store',
  storeTagline: 'Certified hardware & accessories marketplace',
  merchantEmail: '',
  supportPhone: '',
  returnPolicyDays: 30,
  lowStockAlertThreshold: 5,
  autoNotifyNewOrders: true,
  autoNotifyLowStock: true,
  currency: 'INR (₹)',
  bankAccount: {
    bankName: '',
    accountNumber: '',
    routingNumber: '',
  },
};
