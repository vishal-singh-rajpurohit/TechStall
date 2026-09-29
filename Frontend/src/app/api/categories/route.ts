import { NextResponse } from 'next/server';
import { CategoryInfo, ProductCategory } from '@/types';

export const dynamic = 'force-dynamic';

const BASE_CATEGORIES: Array<{
  id: ProductCategory;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
}> = [
  {
    id: 'monitors',
    name: 'Monitors & Displays',
    slug: 'monitors',
    description: '4K UHD, Gaming OLED, Ultrawide, and Professional Studio Displays',
    icon: 'Monitor',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'laptops',
    name: 'Laptops & Workstations',
    slug: 'laptops',
    description: 'Ultra-thin ultrabooks, gaming powerhouses, and creator workstations',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'ssds',
    name: 'SSDs & Storage (SST)',
    slug: 'ssds',
    description: 'PCIe Gen5/Gen4 NVMe M.2 SSDs, portable rugged drives, and SATA storage',
    icon: 'HardDrive',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'accessories',
    name: 'Computer Accessories',
    slug: 'accessories',
    description: 'Mechanical keyboards, wireless precision mice, Thunderbolt docks, audio',
    icon: 'Keyboard',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
  },
];

export async function GET() {
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
  const categoryCounts: Record<string, number> = {
    monitors: 0,
    laptops: 0,
    ssds: 0,
    accessories: 0,
  };

  try {
    const res = await fetch(`${backendUrl}/api/v1/product/get/products`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const products = await res.json();
      if (Array.isArray(products)) {
        for (const p of products) {
          const rawCat = (p.category || '').toLowerCase();
          const rawTitle = (p.title || '').toLowerCase();
          if (
            rawCat.includes('laptop') ||
            rawTitle.includes('laptop') ||
            rawTitle.includes('ideapad') ||
            rawTitle.includes('vivobook') ||
            rawTitle.includes('macbook') ||
            rawTitle.includes('aspire') ||
            rawTitle.includes('victus') ||
            rawTitle.includes('thinkpad')
          ) {
            categoryCounts.laptops += 1;
          } else if (
            rawCat.includes('monitor') ||
            rawTitle.includes('monitor') ||
            rawTitle.includes('oled display') ||
            rawTitle.includes('curved display')
          ) {
            categoryCounts.monitors += 1;
          } else if (
            rawCat.includes('ssd') ||
            rawCat.includes('storage') ||
            rawTitle.includes('ssd') ||
            rawTitle.includes('nvme') ||
            rawTitle.includes('hard drive')
          ) {
            categoryCounts.ssds += 1;
          } else {
            categoryCounts.accessories += 1;
          }
        }
      }
    }
  } catch (error) {
    // If backend unreachable, continue with zero counts
  }

  const categories: CategoryInfo[] = BASE_CATEGORIES.map((cat) => ({
    ...cat,
    itemCount: categoryCounts[cat.id] || 0,
  }));

  return NextResponse.json(categories);
}
