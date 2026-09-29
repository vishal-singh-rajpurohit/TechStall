import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Customer Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both your email and password.');
        }

        try {
          const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
          const res = await fetch(`${backendUrl}/api/v1/auth/user/login`, {
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
          const user = data.user || {};
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || credentials.email;

          return {
            id: String(user.id || 'user_id'),
            name: fullName,
            email: user.email || credentials.email,
            accessToken: data.access_token || '',
            refreshToken: data.refresh_token || '',
            role: 'customer',
            image: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-semantic-ecommerce-key-2026',
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role || 'customer';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || 'customer';
        (session as any).accessToken = token.accessToken as string;
        (session as any).userId = token.id as string;
      }
      return session;
    },
  },
};
