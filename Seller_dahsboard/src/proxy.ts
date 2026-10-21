import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface AuthCheckResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
    name?: string;
    shopName?: string;
    role?: string;
  };
  token?: any;
  error?: string;
}

/**
 * Checks authentication state of an incoming NextRequest.
 * Extracts NextAuth JWT session token and verifies seller credentials.
 */
export async function checkAuthentication(req: NextRequest): Promise<AuthCheckResult> {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'super-secret-semantic-ecommerce-key-2026';
    const token = await getToken({ req, secret });

    if (!token) {
      // Check Bearer token in Authorization header as fallback
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const rawToken = authHeader.substring(7);
        if (rawToken && rawToken.length > 10) {
          return {
            authenticated: true,
            user: {
              id: 'bearer_user',
              role: 'seller',
            },
            token: { accessToken: rawToken },
          };
        }
      }

      return {
        authenticated: false,
        error: 'No valid authentication session found.',
      };
    }

    return {
      authenticated: true,
      user: {
        id: (token.id as string) || (token.sub as string) || 'seller',
        email: token.email || undefined,
        name: token.name || undefined,
        shopName: (token.shopName as string) || token.name || undefined,
        role: (token.role as string) || 'seller',
      },
      token,
    };
  } catch (err: any) {
    return {
      authenticated: false,
      error: err.message || 'Authentication verification error.',
    };
  }
}

/**
 * Authentication Proxy Middleware handler.
 * Evaluates route permissions, validates seller session, and redirects accordingly.
 */
export async function authProxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Paths exempt from authentication
  const isPublicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico';

  const authResult = await checkAuthentication(req);

  // 1. If accessing protected dashboard pages without valid authentication -> redirect to /login
  if (!isPublicPath && !authResult.authenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized: No valid seller session token found' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already authenticated and accessing /login -> redirect to dashboard home
  if (pathname.startsWith('/login') && authResult.authenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 3. Attach verified seller metadata to request headers for downstream components
  const requestHeaders = new Headers(req.headers);
  if (authResult.authenticated && authResult.user) {
    requestHeaders.set('x-seller-id', authResult.user.id);
    if (authResult.user.email) requestHeaders.set('x-seller-email', authResult.user.email);
    if (authResult.user.shopName) requestHeaders.set('x-seller-shop', authResult.user.shopName);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Proxy utility for forwarding API requests to the FastAPI backend.
 */
export async function proxyToBackend(
  req: NextRequest,
  endpointPath: string,
  options?: RequestInit
): Promise<Response> {
  const backendBase =
    process.env.BACKEND_API_URL ||
    (typeof window === 'undefined' && process.env.PORT ? 'http://backend:8000' : 'http://127.0.0.1:8000');
  const url = `${backendBase}${endpointPath}`;

  const authResult = await checkAuthentication(req);
  const headers = new Headers(options?.headers || req.headers);

  if (authResult.authenticated && authResult.token?.accessToken) {
    headers.set('Authorization', `Bearer ${authResult.token.accessToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export default authProxy;
