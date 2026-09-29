import { NextResponse } from 'next/server';
import { BrandInfo } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

  try {
    const res = await fetch(`${backendUrl}/api/v1/product/get/products`, {
      cache: 'no-store',
    });

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

        const liveBrands: BrandInfo[] = Object.entries(brandCounts).map(([name, count]) => ({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          logo: `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.svg`,
          itemCount: count,
        }));

        return NextResponse.json(liveBrands);
      }
    }
  } catch (error) {
    // If backend is unreachable, return empty list
  }

  return NextResponse.json([]);
}
