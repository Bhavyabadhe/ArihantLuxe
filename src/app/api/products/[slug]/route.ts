import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[slug] — Fetch a single product by slug or id from Prisma
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          !isNaN(Number(decodedSlug)) ? { id: Number(decodedSlug) } : {}
        ]
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product from Prisma by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

