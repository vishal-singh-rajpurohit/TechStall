export type ProductCategory = 'monitors' | 'laptops' | 'ssds' | 'accessories';

export interface ProductSpecification {
  [key: string]: string;
}

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductReviewsData {
  productId: string;
  averageRating: number;
  reviewsCount: number;
  ratingBreakdown: Record<number, number>;
  reviews: Review[];
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

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  badge?: 'HOT' | 'SALE' | 'NEW' | 'BESTSELLER';
  shortDescription: string;
  description: string;
  images: string[];
  videos?: string[];
  media?: ProductMediaItem[];
  specifications: ProductSpecification;
  features: string[];
  reviews: Review[];
  isFeatured?: boolean;
  isLimitedSale?: boolean;
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  icon: string;
  image: string;
}

export interface BrandInfo {
  id: string;
  name: string;
  logo: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSpec?: string;
}

export interface FilterParams {
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  minRating?: number;
  search?: string;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  availableBrands: string[];
  priceRange: { min: number; max: number };
}

// ----------------- RAZORPAY PAYMENT TYPES -----------------
export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (e.g. 10000 = ₹100.00)
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler?: (response: RazorpayPaymentSuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
    confirm_close?: boolean;
    ondismiss?: () => void;
    animation?: boolean;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
  close: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
