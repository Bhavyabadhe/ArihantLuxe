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

// PUT /api/products/[slug] — Update an existing product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const body = await request.json();

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          !isNaN(Number(decodedSlug)) ? { id: Number(decodedSlug) } : {}
        ]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const imagesList: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter(Boolean)
      : body.image ? [body.image] : existing.images;
    const image = imagesList[0] || body.image || existing.image;
    const price = typeof body.price === 'number' ? body.price : parseFloat(body.price || String(existing.price));
    const stock = typeof body.stock === 'number' ? body.stock : parseInt(body.stock || String(existing.stock), 10);

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: body.name ?? existing.name,
        price,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        badge: body.badge !== undefined ? body.badge : existing.badge,
        stock,
        image,
        images: imagesList,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update product in Prisma:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[slug] — Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          !isNaN(Number(decodedSlug)) ? { id: Number(decodedSlug) } : {}
        ]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product from Prisma:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

