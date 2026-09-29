import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://techstall-computer-accessories.vercel.app';
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Category pages
  const categoryIds = ['monitors', 'laptops', 'ssds', 'accessories'];
  const categoryRoutes: MetadataRoute.Sitemap = categoryIds.map((catId) => ({
    url: `${baseUrl}/products?category=${catId}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Fetch live products for product detail routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${backendUrl}/api/v1/product/get/products`, { cache: 'no-store' });
    if (res.ok) {
      const liveProducts = await res.json();
      if (Array.isArray(liveProducts)) {
        productRoutes = liveProducts.map((p: any) => ({
          url: `${baseUrl}/products/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
        }));
      }
    }
  } catch {}

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
