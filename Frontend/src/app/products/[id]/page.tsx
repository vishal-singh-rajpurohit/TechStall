import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mapBackendProduct } from '@/lib/productMapper';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { Product } from '@/types';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// ISR (Incremental Static Regeneration): Revalidate page in background every 60 seconds
export const revalidate = 60;

async function getProductData(id: string): Promise<{ product: Product; related: Product[] } | null> {
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/v1/product/get/${id}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const bp = await res.json();
      if (bp && bp.id) {
        const product = mapBackendProduct(bp);

        let related: Product[] = [];
        try {
          const relRes = await fetch(`${backendUrl}/api/v1/product/get/products`, {
            next: { revalidate: 60 },
          });
          if (relRes.ok) {
            const all = await relRes.json();
            if (Array.isArray(all)) {
              related = all
                .map(mapBackendProduct)
                .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
                .slice(0, 4);
            }
          }
        } catch {}

        return { product, related };
      }
    }
  } catch (err) {
    // Backend momentarily offline
  }

  return null;
}

// Pre-render live products at build time (SSG + ISR)
export async function generateStaticParams() {
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/v1/product/get/products`);
    if (res.ok) {
      const all = await res.json();
      if (Array.isArray(all)) {
        return all.map((p: any) => ({ id: String(p.id) }));
      }
    }
  } catch {}
  return [];
}

// Dynamic SEO Metadata for individual hardware product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const data = await getProductData(params.id);

  if (!data) {
    return {
      title: 'Hardware Product Not Found | TechStall',
    };
  }

  const { product } = data;
  const title = `${product.title} | TechStall`;
  const description = `${product.shortDescription} Buy online with manufacturer warranty and fast delivery.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const data = await getProductData(params.id);

  if (!data) {
    notFound();
  }

  const { product, related: relatedProducts } = data;

  // Schema.org Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://techstall-computer-accessories.vercel.app/products/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://techstall-computer-accessories.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.categoryLabel,
        item: `https://techstall-computer-accessories.vercel.app/products?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `https://techstall-computer-accessories.vercel.app/products/${product.id}`,
      },
    ],
  };

  return (
    <>
      {/* Inject JSON-LD Rich Snippets for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
