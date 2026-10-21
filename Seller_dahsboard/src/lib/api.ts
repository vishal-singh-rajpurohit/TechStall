import { ProductMediaItem } from '@/types/seller';
import { getSession } from 'next-auth/react';

export function getApiBase(): string {
  if (typeof window === 'undefined') {
    // Server-side (Node.js runtime inside Docker or Next.js server)
    const backendInternal =
      process.env.BACKEND_API_URL ||
      (process.env.PORT ? 'http://backend:8000' : 'http://127.0.0.1:8000');
    return `${backendInternal}/api/v1`;
  }
  // Client-side (Browser runtime)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}

export function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export async function getAuthHeaders(token?: string | null): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  let authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null);

  if (!authToken && typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if ((session as any)?.accessToken) {
        authToken = (session as any).accessToken;
        localStorage.setItem('seller_token', authToken as string);
      }
    } catch {
      // fallback
    }
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

// ----------------- SELLER AUTH API -----------------
export const sellerAuthAPI = {
  checkHealth: async () => {
    const res = await fetch(`${getApiBase()}/auth/seller/`);
    return handleResponse<{ status: string; module: string }>(res);
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    conform_password?: string;
    mobile_number: string;
    address?: string;
    city?: string;
    state?: string;
    pin_code?: string;
  }) => {
    const body = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      conform_password: payload.conform_password || payload.password,
      mobile_number: payload.mobile_number,
      address: payload.address || 'Tech Hub 4th Floor',
      city: payload.city || 'Bengaluru',
      state: payload.state || 'Karnataka',
      pin_code: payload.pin_code || '560025',
    };
    const res = await fetch(`${getApiBase()}/auth/seller/register`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await handleResponse<any>(res);
    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('seller_token', data.access_token);
    }
    return data;
  },

  login: async (payload: { email?: string; contact_number?: string; password: string }) => {
    const res = await fetch(`${getApiBase()}/auth/seller/login`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<any>(res);
    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('seller_token', data.access_token);
    }
    return data;
  },

  logout: async () => {
    const res = await fetch(`${getApiBase()}/auth/seller/logout`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      credentials: 'include',
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seller_token');
    }
    return handleResponse<any>(res);
  },

  refresh: async () => {
    const res = await fetch(`${getApiBase()}/auth/seller/refresh`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  getMe: async (token?: string) => {
    const res = await fetch(`${getApiBase()}/auth/seller/me`, {
      headers: await getAuthHeaders(token),
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  verify: async (token?: string) => {
    const res = await fetch(`${getApiBase()}/auth/seller/verify`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      credentials: 'include',
      body: token ? JSON.stringify({ token }) : undefined,
    });
    return handleResponse<any>(res);
  },
};

// ----------------- SELLER PRODUCT MANAGEMENT API -----------------
export const sellerProductAPI = {
  getProducts: async (productId?: string, token?: string) => {
    const url = productId
      ? `${getApiBase()}/auth/seller/get-product/${productId}`
      : `${getApiBase()}/auth/seller/get-product`;
    const headers = await getAuthHeaders(token);
    const res = await fetch(url, {
      headers,
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  uploadMedia: async (payload: {
    url: string;
    media_type?: 'image' | 'video';
    is_primary?: boolean;
    order?: number;
  }, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${getApiBase()}/auth/seller/upload-media`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  createProduct: async (payload: {
    title?: string;
    name?: string;
    description?: string | string[];
    price: number;
    selling_price?: number;
    originalPrice?: number;
    stock?: number;
    stockQuantity?: number;
    category?: string;
    category_title?: string;
    brand?: string;
    sku?: string;
    images?: string[];
    videos?: string[];
    media?: ProductMediaItem[];
    specifications?: Record<string, any>;
  }, token?: string) => {
    const originalPrice = payload.originalPrice || payload.price;
    const sellingPrice = payload.selling_price || payload.price;
    const desc = Array.isArray(payload.description)
      ? payload.description
      : (payload.description ? [payload.description] : ['High performance computer accessory']);

    const body: Record<string, any> = {
      title: payload.title || payload.name || 'New Hardware Product',
      description: desc,
      price: originalPrice,
      selling_price: sellingPrice,
      stock: payload.stock ?? payload.stockQuantity ?? 10,
      brand: payload.brand || 'QuantumTech',
      sku: payload.sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
      category_title: payload.category_title || payload.category || 'monitors',
      images: payload.images && payload.images.length > 0
        ? payload.images
        : ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
      specifications: payload.specifications || {},
    };

    if (payload.videos && payload.videos.length > 0) {
      body.videos = payload.videos;
    }
    if (payload.media && payload.media.length > 0) {
      body.media = payload.media;
    }

    const headers = await getAuthHeaders(token);
    const res = await fetch(`${getApiBase()}/auth/seller/new-product`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  modifyProduct: async (payload: {
    product_id: string;
    title?: string;
    name?: string;
    description?: string | string[];
    price?: number;
    selling_price?: number;
    originalPrice?: number;
    stock?: number;
    stockQuantity?: number;
    category?: string;
    brand?: string;
    sku?: string;
    images?: string[];
    videos?: string[];
    media?: ProductMediaItem[];
    specifications?: Record<string, any>;
    isActive?: boolean;
  }, token?: string) => {
    const body: Record<string, any> = {
      product_id: payload.product_id,
    };
    if (payload.title || payload.name) body.title = payload.title || payload.name;
    if (payload.description) {
      body.description = Array.isArray(payload.description) ? payload.description : [payload.description];
    }
    if (payload.price !== undefined) body.selling_price = payload.price;
    if (payload.originalPrice !== undefined) body.price = payload.originalPrice;
    if (payload.stock !== undefined || payload.stockQuantity !== undefined) {
      body.stock = payload.stock ?? payload.stockQuantity;
    }
    if (payload.brand) body.brand = payload.brand;
    if (payload.sku) body.sku = payload.sku;
    if (payload.category) body.category_title = payload.category;
    if (payload.images) body.images = payload.images;
    if (payload.videos) body.videos = payload.videos;
    if (payload.media) body.media = payload.media;
    if (payload.specifications) body.specifications = payload.specifications;
    if (payload.isActive !== undefined) body.isActive = payload.isActive;

    const headers = await getAuthHeaders(token);
    const res = await fetch(`${getApiBase()}/auth/seller/modify-product`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  deleteProduct: async (productId: string, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${getApiBase()}/auth/seller/delete-prodct`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ product_id: productId }),
    });
    return handleResponse<any>(res);
  },

  changeStock: async (productId: string, stock: number, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${getApiBase()}/auth/seller/change-stock`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ product_id: productId, stock }),
    });
    return handleResponse<any>(res);
  },
};

// ----------------- SELLER ORDER MANAGEMENT API -----------------
export const sellerOrderAPI = {
  getOrders: async (token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${getApiBase()}/auth/seller/orders/get-orders`, {
      headers,
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  getOrderById: async (orderId: string, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${getApiBase()}/auth/seller/orders/get/${orderId}`, {
      headers,
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  changeOrderStatus: async (
    orderId: string,
    status: string,
    options?: { shipping_carrier?: string; tracking_number?: string },
    token?: string
  ) => {
    const headers = await getAuthHeaders(token);
    const body: Record<string, any> = {
      order_id: orderId,
      status,
    };
    if (options?.shipping_carrier) body.shipping_carrier = options.shipping_carrier;
    if (options?.tracking_number) body.tracking_number = options.tracking_number;

    const res = await fetch(`${getApiBase()}/auth/seller/orders/change-order-status`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },
};
