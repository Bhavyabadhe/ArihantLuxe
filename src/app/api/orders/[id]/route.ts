import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[id] — Fetch single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — Update order status or details
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.paymentId ? { paymentId: body.paymentId } : {}),
        ...(body.paymentMethod ? { paymentMethod: body.paymentMethod } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update order in Prisma:', error);
    return NextResponse.json({ error: 'Failed to update order', details: error.message }, { status: 500 });
  }
}

// DELETE /api/orders/[id] — Delete order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete order in Prisma:', error);
    return NextResponse.json({ error: 'Failed to delete order', details: error.message }, { status: 500 });
  }
}
