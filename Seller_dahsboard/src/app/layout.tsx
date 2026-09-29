import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { SellerProvider } from '@/context/SellerContext';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { NavigationProgressBar } from '@/components/layout/NavigationProgressBar';

export const metadata: Metadata = {
  title: 'Merchant Seller Portal | TechStall Hardware Dashboard',
  description:
    'Manage computer hardware inventory, track orders, monitor real-time sales revenue, and handle customer reviews.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <AuthProvider>
          <SellerProvider>
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            <DashboardShell>{children}</DashboardShell>
          </SellerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
