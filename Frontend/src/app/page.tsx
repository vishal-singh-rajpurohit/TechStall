import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustBadges } from '@/components/home/TrustBadges';
import { PopularBrands } from '@/components/home/PopularBrands';
import { FeaturedTabs } from '@/components/home/FeaturedTabs';
import { Testimonials } from '@/components/home/Testimonials';

// SSG: Pre-rendered statically at build time for optimal TTFB and SEO crawlability
export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <TrustBadges />
      <PopularBrands />
      <FeaturedTabs />
      <Testimonials />
    </div>
  );
}
