import { NextResponse } from 'next/server';
import { mapBackendProduct } from '@/lib/productMapper';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

  // 1. Fetch live product from Backend API
  let product: Product | undefined;
  try {
    const res = await fetch(`${backendUrl}/api/v1/product/get/${id}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const bp = await res.json();
      if (bp && bp.id) {
        product = mapBackendProduct(bp);
      }
    }
  } catch (err) {
    // Backend momentarily offline
  }

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  // 2. Find related products from live backend inventory
  let related: Product[] = [];
  try {
    const relRes = await fetch(`${backendUrl}/api/v1/product/get/products`, { cache: 'no-store' });
    if (relRes.ok) {
      const allBp = await relRes.json();
      if (Array.isArray(allBp)) {
        related = allBp
          .map(mapBackendProduct)
          .filter((p) => p.id !== product!.id && (p.category === product!.category || p.brand === product!.brand))
          .slice(0, 4);
      }
    }
  } catch (err) {
    // Backend momentarily offline
  }

  return NextResponse.json({ product, related });
}
