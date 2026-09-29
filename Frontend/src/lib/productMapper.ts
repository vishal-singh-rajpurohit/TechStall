import { Product, ProductCategory } from '@/types';

export function mapBackendProduct(bp: any): Product {
  let images: string[] = [];

  if (Array.isArray(bp.images) && bp.images.length > 0) {
    images = bp.images;
  } else if (Array.isArray(bp.media) && bp.media.length > 0) {
    images = bp.media.filter((m: any) => m.media_type === 'image').map((m: any) => m.url);
  }

  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'];
  }

  let specs: Record<string, string> = {};
  try {
    specs = typeof bp.specifications === 'string' ? JSON.parse(bp.specifications) : (bp.specifications || {});
  } catch {
    specs = {};
  }

  const originalPrice = bp.price || bp.selling_price || 999;
  const price = bp.selling_price || bp.price || 999;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const rawCat = (bp.category || '').toLowerCase();
  const rawTitle = (bp.title || '').toLowerCase();
  let category: ProductCategory = 'accessories';
  let categoryLabel = 'Computer Accessories';

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
    category = 'laptops';
    categoryLabel = 'Laptops & Workstations';
  } else if (
    rawCat.includes('monitor') ||
    rawTitle.includes('monitor') ||
    rawTitle.includes('oled display') ||
    rawTitle.includes('curved display')
  ) {
    category = 'monitors';
    categoryLabel = 'Monitors & Displays';
  } else if (
    rawCat.includes('ssd') ||
    rawCat.includes('storage') ||
    rawTitle.includes('ssd') ||
    rawTitle.includes('nvme') ||
    rawTitle.includes('hard drive')
  ) {
    category = 'ssds';
    categoryLabel = 'SSDs & Storage (SST)';
  }

  return {
    id: String(bp.id),
    slug: bp.title ? bp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : String(bp.id),
    title: bp.title || 'High Performance Product',
    brand: bp.brand || 'QuantumTech',
    category,
    categoryLabel,
    price,
    originalPrice: originalPrice > price ? originalPrice : undefined,
    discountPercentage: discount > 0 ? discount : undefined,
    rating: typeof bp.rating === 'number' ? bp.rating : 0.0,
    reviewsCount: typeof bp.reviews_count === 'number' ? bp.reviews_count : 0,
    inStock: bp.stock > 0 && bp.isActive !== false,
    stockQuantity: bp.stock ?? 15,
    sku: bp.sku || `SKU-${String(bp.id).slice(0, 8)}`,
    badge: discount > 15 ? 'SALE' : 'HOT',
    shortDescription: Array.isArray(bp.description) ? bp.description.join(', ') : (bp.description || bp.title || ''),
    description: Array.isArray(bp.description) ? bp.description.join('\n') : (bp.description || bp.title || ''),
    images,
    videos: Array.isArray(bp.videos) ? bp.videos : [],
    media: Array.isArray(bp.media) ? bp.media : [],
    specifications: specs,
    features: Array.isArray(bp.description) ? bp.description : [bp.description || 'High Performance Accessory'],
    reviews: [],
    isFeatured: true,
  };
}
