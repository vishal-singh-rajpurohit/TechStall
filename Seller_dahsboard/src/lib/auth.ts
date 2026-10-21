import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

let cachedBackendUrl: string | null = null;

export async function resolveBackendUrl(): Promise<string> {
  if (cachedBackendUrl) return cachedBackendUrl;

  if (process.env.BACKEND_API_URL) {
    cachedBackendUrl = process.env.BACKEND_API_URL;
    return cachedBackendUrl;
  }

  // Inside Docker network, check container hostname 'backend'
  try {
    const probe = await fetch('http://backend:8000/api/v1/auth/seller/', {
      signal: AbortSignal.timeout(1200),
    });
    if (probe.ok || probe.status === 401 || probe.status === 403 || probe.status === 404) {
      cachedBackendUrl = 'http://backend:8000';
      return cachedBackendUrl;
    }
  } catch {
    // Docker hostname not resolvable (e.g. running on local machine host)
  }

  cachedBackendUrl = 'http://127.0.0.1:8000';
  return cachedBackendUrl;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Seller Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'seller@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password.');
        }

        try {
          const backendUrl = await resolveBackendUrl();
          const cleanEmail = credentials.email.trim().toLowerCase();

          const res = await fetch(`${backendUrl}/api/v1/auth/seller/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            let errorMsg = 'Invalid email or password.';
            try {
              const errData = await res.json();
              errorMsg = errData.detail || errData.message || errorMsg;
            } catch {
              // fallback
            }
            throw new Error(errorMsg);
          }

          const data = await res.json();
          const seller = data.seller || {};
          const sellerName =
            seller.name ||
            seller.shop_name ||
            `${seller.first_name || ''} ${seller.last_name || ''}`.trim() ||
            seller.email ||
            credentials.email;

          return {
            id: String(seller.id || 'seller_id'),
            name: sellerName,
            email: seller.email || cleanEmail,
            shopName: seller.name || seller.shop_name || 'Hardware Hub',
            role: 'seller',
            accessToken: data.access_token || '',
            refreshToken: data.refresh_token || '',
          } as any;
        } catch (err: any) {
          console.error('[Seller Auth Authorize Error]:', err.message);
          throw new Error(err.message || 'Authentication service unreachable.');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-semantic-ecommerce-key-2026',
  useSecureCookies: false, // ensures cookie works over http in localhost and dev environments
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'seller';
        token.shopName = (user as any).shopName || user.name;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).shopName = token.shopName as string;
        (session as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};
