import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products — Fetch all products from Prisma PostgreSQL database
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
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
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Failed to create product in Prisma:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
