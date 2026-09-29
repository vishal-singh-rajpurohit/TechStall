import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
          const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
          const res = await fetch(`${backendUrl}/api/v1/auth/seller/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email.trim(),
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
          const sellerName = seller.shop_name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim() || seller.email || credentials.email;

          return {
            id: String(seller.id || 'seller_id'),
            name: sellerName,
            email: seller.email || credentials.email,
            shopName: seller.shop_name || 'Hardware Hub',
            role: 'seller',
            accessToken: data.access_token || '',
            refreshToken: data.refresh_token || '',
          } as any;
        } catch (err: any) {
          throw new Error(err.message || 'Authentication service unreachable.');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'seller_dashboard_secret_key_super_secure_2026',
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
