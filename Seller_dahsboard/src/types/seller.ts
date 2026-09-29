export type HardwareCategory = 'monitors' | 'laptops' | 'ssds' | 'accessories';

export interface ProductSpecification {
  [key: string]: string;
}

export interface ProductMediaItem {
  id?: string;
  product_id?: string;
  media_type: 'image' | 'video';
  url: string;
  public_id?: string;
  thumbnail_url?: string;
  format?: string;
  is_primary?: boolean;
  order?: number;
}

export interface SellerProduct {
  id: string;
  sku: string;
  title: string;
  brand: string;
  category: HardwareCategory;
  categoryLabel: string;
  price: number;
  costPrice: number;
  originalPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  videos?: string[];
  media?: ProductMediaItem[];
  description: string;
  specifications: ProductSpecification;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  salesCount: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productTitle: string;
  category: HardwareCategory;
  sku: string;
  quantity: number;
  price: number;
  image: string;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerReview {
  id: string;
  productId: string;
  productTitle: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  sellerReply?: string;
  status: 'published' | 'pending' | 'flagged';
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  merchantEmail: string;
  supportPhone: string;
  returnPolicyDays: number;
  lowStockAlertThreshold: number;
  autoNotifyNewOrders: boolean;
  autoNotifyLowStock: boolean;
  currency: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
}
