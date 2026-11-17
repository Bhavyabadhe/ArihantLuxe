import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders — Fetch orders (optionally filtered by email)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    const orders = await prisma.order.findMany({
      where: email
        ? {
            userEmail: {
              equals: email.trim(),
              mode: 'insensitive',
            },
          }
        : {},
      orderBy: { createdAt: 'desc' },
      ...(limit > 0 ? { take: limit } : {}),
    });

    return NextResponse.json(orders, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Failed to fetch orders from Prisma:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — Record a new order in Prisma / Neon PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userEmail || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Missing required order fields: userEmail and items array are required.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userEmail: body.userEmail.trim(),
        userFullName: body.userFullName?.trim() || 'Guest Customer',
        items: body.items,
        subtotal: Number(body.subtotal) || 0,
        shippingFee: Number(body.shippingFee) || 0,
        total: Number(body.total) || 0,
        shippingAddress: body.shippingAddress || {},
        status: body.status || 'paid_pending_verification',
        paymentMethod: body.paymentMethod || 'youpi_upi',
        paymentId: body.paymentId || null,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create order in Prisma/Neon:', error);
    return NextResponse.json(
      { error: 'Failed to create order in database', details: error.message },
      { status: 500 }
    );
  }
}
