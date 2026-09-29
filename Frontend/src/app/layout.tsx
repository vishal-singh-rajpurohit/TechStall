import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { CartProvider } from '@/context/CartContext';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { MobileNav } from '@/components/layout/MobileNav';
import { NavigationProgressBar } from '@/components/layout/NavigationProgressBar';

export const metadata: Metadata = {
  metadataBase: new URL('https://techstall-computer-accessories.vercel.app'),
  title: {
    default: 'TechStall | Certified Computer Accessories, 4K Monitors, Laptops & SSDs',
    template: '%s | TechStall Computer Hub',
  },
  description:
    'Shop the finest computer accessories: 4K QD-OLED gaming displays, ultrabooks, PCIe Gen5 NVMe SSDs, and custom mechanical keyboards with verified manufacturer warranties.',
  keywords: [
    'Computer accessories',
    'Monitors',
    '4K OLED Monitor',
    'Gaming Laptops',
    'SSDs',
    'PCIe Gen5 SSD',
    'Mechanical Keyboards',
    'Ergonomic Mice',
    'Thunderbolt Docks',
  ],
  authors: [{ name: 'TechStall Hardware Inc.' }],
  creator: 'TechStall',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://techstall-computer-accessories.vercel.app',
    siteName: 'TechStall Computer Accessories',
    title: 'TechStall | Premium Computer Hardware & Accessories',
    description:
      'Explore top-rated 4K displays, high-speed NVMe storage, and creator laptops. Fast worldwide shipping.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'TechStall Computer Accessories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechStall | Premium Computer Hardware & Accessories',
    description: 'Explore top-rated 4K displays, high-speed NVMe storage, and creator laptops.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Global JSON-LD Organization Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'TechStall Computer Accessories',
              url: 'https://techstall-computer-accessories.vercel.app',
              logo: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-800-555-8324',
                contactType: 'customer service',
                availableLanguage: ['English', 'Spanish'],
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <QueryProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <NavigationProgressBar />
              </Suspense>
              <TopBar />
              <Header />
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <CartDrawer />
              <MobileNav />
              <Footer />
            </CartProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
