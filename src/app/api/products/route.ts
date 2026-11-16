import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products — Fetch products with bandwidth optimization and edge caching
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAllImages = searchParams.get('includeAllImages') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      ...(limit > 0 ? { take: limit } : {}),
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        category: true,
        description: true,
        image: true,
        badge: true,
        stock: true,
        size: true,
        color: true,
        createdAt: true,
        // Omit the heavy multi-megabyte images array from general catalog listings
        ...(includeAllImages ? { images: true } : {}),
      },
    });

    return NextResponse.json(products, {
      headers: {
        // Cache at Vercel Edge for 60s, stale-while-revalidate for 5 minutes
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Failed to fetch products from Prisma:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — Create a new product in the database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name || body.title || 'Untitled Product';
    const slug =
      body.slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const imagesList: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter(Boolean)
      : body.image ? [body.image] : [];
    const image = imagesList[0] || body.image || null;
    const price = typeof body.price === 'number' ? body.price : parseFloat(body.price || '0');
    const stock = typeof body.stock === 'number' ? body.stock : parseInt(body.stock || '0', 10);

    const sizeList: string[] = Array.isArray(body.size)
      ? body.size.filter(Boolean)
      : typeof body.size === 'string' && body.size.trim()
        ? body.size.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    const colorList: string[] = Array.isArray(body.color)
      ? body.color.filter(Boolean)
      : typeof body.color === 'string' && body.color.trim()
        ? body.color.split(',').map((c: string) => c.trim()).filter(Boolean)
        : [];

    const newProduct = await prisma.product.create({
      data: {
        slug,
        name,
        description: body.description || '',
        price,
        image,
        images: imagesList,
        category: body.category || 'All',
        badge: body.badge || null,
        stock,
        size: sizeList,
        color: colorList,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Failed to create product in Prisma:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
