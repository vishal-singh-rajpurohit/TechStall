import { Metadata } from 'next';
import { ProductCatalogView } from '@/components/products/ProductCatalogView';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    wishlisted?: string;
    limitedSale?: string;
  };
}

// SSR: Dynamic server-side metadata generation based on incoming query parameters
export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { category, brand, q } = searchParams;

  let title = 'Computer Accessories & Hardware Catalog';
  let description =
    'Browse our complete catalog of certified computer accessories, gaming monitors, laptops, and ultra-fast SSD storage.';

  if (category) {
    const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
    title = `${capitalized} & Accessories | TechStall`;
    description = `Discover top-rated ${category} with manufacturer warranties, competitive pricing, and fast dispatch.`;
  } else if (brand) {
    title = `${brand} Hardware & Accessories | TechStall`;
    description = `Explore high-performance ${brand} computer accessories, displays, and storage devices.`;
  } else if (q) {
    title = `Search results for "${q}" | TechStall`;
    description = `Shop hardware products matching "${q}" at TechStall with verified customer reviews.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

// SSR (Server-Side Rendering) for dynamic search & filtering
export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return <ProductCatalogView />;
}
