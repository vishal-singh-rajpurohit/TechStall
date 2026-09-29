'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

function AuthTokenSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (status === 'authenticated' && (session as any)?.accessToken) {
      localStorage.setItem('access_token', (session as any).accessToken);
      if (session.user) {
        localStorage.setItem(
          'user_profile',
          JSON.stringify({
            id: (session.user as any).id,
            name: session.user.name,
            email: session.user.email,
          })
        );
      }
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
    }
  }, [session, status]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthTokenSync>{children}</AuthTokenSync>
    </SessionProvider>
  );
}
