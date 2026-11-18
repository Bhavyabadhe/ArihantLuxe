import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id);

    // Look up product by id or slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          !isNaN(Number(cleanId)) ? { id: Number(cleanId) } : {},
          { slug: cleanId },
        ],
      },
      select: { image: true },
    });

    if (!product || !product.image) {
      return new Response('Image not found', { status: 404 });
    }

    const raw = product.image.trim();

    // If it's already an external URL, redirect directly
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return NextResponse.redirect(raw, 307);
    }

    // If it's a data URL (e.g. data:image/jpeg;base64,....)
    if (raw.startsWith('data:image/')) {
      const parts = raw.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'image/jpeg';
      const base64Data = parts[1];

      if (!base64Data) {
        return new Response('Corrupted image data', { status: 500 });
      }

      const buffer = Buffer.from(base64Data, 'base64');

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(buffer.length),
          // Cache image forever in browser & CDN for instant loads
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new Response('Unsupported image format', { status: 400 });
  } catch (err: any) {
    console.error('Failed to stream product image:', err);
    return new Response('Internal error', { status: 500 });
  }
}
