import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface AuthCheckResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  };
  token?: any;
  error?: string;
}

/**
 * Checks authentication state of an incoming NextRequest on the Customer Storefront.
 * Extracts NextAuth JWT session token and verifies customer credentials.
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
              id: 'bearer_customer',
              role: 'customer',
            },
            token: { accessToken: rawToken },
          };
        }
      }

      return {
        authenticated: false,
        error: 'No active customer authentication session found.',
      };
    }

    return {
      authenticated: true,
      user: {
        id: (token.id as string) || (token.sub as string) || 'user',
        email: token.email || undefined,
        name: token.name || undefined,
        role: (token.role as string) || 'customer',
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
 * Storefront Authentication Proxy Middleware handler.
 * Evaluates route permissions, validates customer session, and redirects accordingly.
 */
export async function authProxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Paths requiring authenticated customer session
  const isProtectedPath =
    pathname.startsWith('/account') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/profile');

  const authResult = await checkAuthentication(req);

  // 1. If accessing protected paths without valid authentication -> redirect to signin
  if (isProtectedPath && !authResult.authenticated) {
    const signinUrl = new URL('/auth/signin', req.url);
    signinUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    return NextResponse.redirect(signinUrl);
  }

  // 2. If already authenticated and accessing signin page -> redirect to home
  if (pathname.startsWith('/auth/signin') && authResult.authenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 3. Attach verified customer metadata to request headers for downstream components & API routes
  const requestHeaders = new Headers(req.headers);
  if (authResult.authenticated && authResult.user) {
    requestHeaders.set('x-user-id', authResult.user.id);
    if (authResult.user.email) requestHeaders.set('x-user-email', authResult.user.email);
    if (authResult.user.name) requestHeaders.set('x-user-name', authResult.user.name);
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
  const backendBase = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
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
