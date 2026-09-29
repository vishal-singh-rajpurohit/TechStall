'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname?.startsWith('/auth/');

  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-slate-900">{children}</main>;
  }

  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
