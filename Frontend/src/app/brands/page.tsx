import { Metadata } from 'next';
import Link from 'next/link';
import { BrandInfo } from '@/types';

export const metadata: Metadata = {
  title: 'Certified Computer Hardware Brands',
  description:
    'Explore authentic computer accessories and hardware from trusted manufacturers including ASUS ROG, Dell, Lenovo, Apple, Samsung, Corsair, and Crucial.',
};

export const dynamic = 'force-dynamic';

async function getLiveBrands(): Promise<BrandInfo[]> {
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/v1/product/get/products`, { cache: 'no-store' });
    if (res.ok) {
      const products = await res.json();
      if (Array.isArray(products) && products.length > 0) {
        const brandCounts: Record<string, number> = {};
        for (const p of products) {
          const brandName = p.brand ? p.brand.trim() : 'QuantumTech';
          if (brandName) {
            brandCounts[brandName] = (brandCounts[brandName] || 0) + 1;
          }
        }

        return Object.entries(brandCounts).map(([name, count]) => ({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          logo: '',
          itemCount: count,
        }));
      }
    }
  } catch {}
  return [];
}

export default async function BrandsPage() {
  const brands = await getLiveBrands();

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
            Partners &amp; Manufacturers
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Official Computer Hardware Brands
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Every product sold at TechStall is backed by official manufacturer warranties and service centers.
          </p>
        </div>

        {brands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-medium">No brands currently available in the live catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50/60 group-hover:bg-brand-500 text-brand-600 group-hover:text-white flex items-center justify-center font-black text-xl tracking-tight transition-colors">
                    {brand.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {brand.name}
                    </h3>
                    <span className="text-xs text-slate-400">{brand.itemCount} Verified Products</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Discover high-performance {brand.name} components, gaming monitors, laptops, and storage accessories.
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                  <span>Browse {brand.name} Gear</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
