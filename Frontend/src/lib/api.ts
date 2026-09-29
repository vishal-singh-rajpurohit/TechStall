import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_BACKEND_API_URL ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1` : 'http://127.0.0.1:8000/api/v1');

export function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export async function getAuthHeaders(token?: string | null): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  let authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

  if (!authToken && typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if ((session as any)?.accessToken) {
        authToken = (session as any).accessToken;
        localStorage.setItem('access_token', authToken as string);
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

// ----------------- USER AUTH API -----------------
export const userAuthAPI = {
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/auth/user/`);
    return handleResponse<{ status: string; module: string }>(res);
  },

  register: async (payload: {
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    mobile_number?: string;
    password: string;
    conform_password?: string;
  }) => {
    const fullName = payload.name || `${payload.first_name || ''} ${payload.last_name || ''}`.trim() || 'Customer';
    const body = {
      name: fullName,
      email: payload.email,
      password: payload.password,
      conform_password: payload.conform_password || payload.password,
      mobile_number: payload.mobile_number,
    };
    const res = await fetch(`${API_BASE}/auth/user/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  login: async (payload: { email?: string; mobile_number?: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/user/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<any>(res);
    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  },

  logout: async () => {
    const res = await fetch(`${API_BASE}/auth/user/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    return handleResponse<any>(res);
  },

  refresh: async () => {
    const res = await fetch(`${API_BASE}/auth/user/refresh`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/user/me`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  verify: async (token?: string) => {
    const res = await fetch(`${API_BASE}/auth/user/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: token ? JSON.stringify({ token }) : undefined,
    });
    return handleResponse<any>(res);
  },
};

// ----------------- PRODUCT STOREFRONT API -----------------
export const productAPI = {
  getProducts: async () => {
    const res = await fetch(`${API_BASE}/product/get/products`);
    return handleResponse<any>(res);
  },

  getProductById: async (id: string) => {
    const res = await fetch(`${API_BASE}/product/get/${id}`);
    return handleResponse<any>(res);
  },

  getCategoryPaginated: async (category: string, page = 1, limit = 12) => {
    const res = await fetch(`${API_BASE}/product/category/${encodeURIComponent(category)}/${page}/${limit}`);
    return handleResponse<any>(res);
  },
};

// ----------------- CART API -----------------
export const cartAPI = {
  getCart: async () => {
    const res = await fetch(`${API_BASE}/cart/`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  addToCart: async (productId: string, quantity = 1) => {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return handleResponse<any>(res);
  },

  removeFromCart: async (productId: string) => {
    const res = await fetch(`${API_BASE}/cart/remove`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId }),
    });
    return handleResponse<any>(res);
  },

  increaseQuantity: async (productId: string, quantity = 1) => {
    const res = await fetch(`${API_BASE}/cart/quantity-inc`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return handleResponse<any>(res);
  },

  decreaseQuantity: async (productId: string, quantity = 1) => {
    const res = await fetch(`${API_BASE}/cart/quantity-dec`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return handleResponse<any>(res);
  },
};

// ----------------- ORDER API -----------------
export const orderAPI = {
  placeOrder: async (payload: {
    address: string;
    city: string;
    state: string;
    pin_code: string;
    mobile_number: string;
    notes?: string;
    direct_buy?: {
      product_id: string;
      quantity: number;
    };
    items?: Array<{
      product_id: string;
      quantity: number;
    }>;
  }, token?: string) => {
    const headers = await getAuthHeaders(token);
    if (!headers['Authorization']) {
      throw new Error('Authentication required: You must be logged in to buy products or place orders.');
    }
    const res = await fetch(`${API_BASE}/order/place-order`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  verifyOrder: async (
    orderId: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string,
    razorpayOrderId?: string,
    token?: string
  ) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_BASE}/order/verify-order`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    });
    return handleResponse<any>(res);
  },

  payOrder: async (orderId: string, paymentMethod = 'razorpay', token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_BASE}/order/pay`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ order_id: orderId, payment_method: paymentMethod }),
    });
    return handleResponse<any>(res);
  },

  getOrderById: async (orderId: string, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_BASE}/order/get-order/${orderId}`, {
      headers,
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  cancelOrder: async (orderId: string, reason?: string, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_BASE}/order/cancel-order`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ order_id: orderId, reason }),
    });
    return handleResponse<any>(res);
  },

  getOrders: async (token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_BASE}/order/orders`, {
      headers,
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },
};

export const reviewAPI = {
  getProductReviews: async (productId: string) => {
    const res = await fetch(`${API_BASE}/product/get/${productId}/reviews`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<any>(res);
  },

  getMyReview: async (productId: string, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_BASE}/product/get/${productId}/reviews/my-review`, {
      headers,
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  submitReview: async (productId: string, rating: number, content: string, token?: string) => {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_BASE}/product/get/${productId}/reviews`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ rating, content }),
    });
    return handleResponse<any>(res);
  },

  deleteReview: async (productId: string, reviewId?: string, token?: string) => {
    const headers = await getAuthHeaders(token);
    const url = reviewId
      ? `${API_BASE}/product/get/${productId}/reviews?review_id=${reviewId}`
      : `${API_BASE}/product/get/${productId}/reviews`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },
};

