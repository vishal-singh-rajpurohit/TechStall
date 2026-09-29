'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PageLoaderContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  loadingMessage: string;
}

const PageLoaderContext = createContext<PageLoaderContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
  loadingMessage: 'Loading...',
});

export function usePageLoader() {
  return useContext(PageLoaderContext);
}

export function NavigationProgressBar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const startLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
    setProgress(20);
  };

  const stopLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 250);
  };

  // Reset loader on route change completed
  useEffect(() => {
    if (isLoading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Animate progress while loading
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        const inc = Math.random() * 12 + 5;
        return Math.min(prev + inc, 88);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Intercept click on internal links to start loading animation immediately
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isInternal =
        href &&
        (href.startsWith('/') || href.startsWith(window.location.origin)) &&
        !href.startsWith('/#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey;

      if (isInternal) {
        const url = new URL(href, window.location.origin);
        const currentUrl = new URL(window.location.href);

        // Don't animate if clicking exact same URL with same hash/search
        if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
          if (url.pathname.includes('/products/')) {
            startLoading('Opening Product Details...');
          } else if (url.pathname.includes('/products')) {
            startLoading('Filtering Catalog...');
          } else {
            startLoading('Loading...');
          }
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => document.removeEventListener('click', handleDocumentClick, { capture: true });
  }, []);

  return (
    <PageLoaderContext.Provider
      value={{
        isLoading,
        startLoading,
        stopLoading,
        loadingMessage,
      }}
    >
      {/* Top Loading Progress Line */}
      {isLoading && (
        <div
          className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
            boxShadow: '0 0 12px rgba(249, 115, 22, 0.8), 0 0 4px rgba(234, 88, 12, 0.6)',
          }}
        />
      )}

      {/* Floating Center Micro Pill Loader */}
      {isLoading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none flex items-center space-x-2.5 px-4 py-2 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/60 text-xs font-bold transition-all animate-bounce">
          <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      )}

      {children}
    </PageLoaderContext.Provider>
  );
}
