import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { createBuyerSchema } from '@/src/lib/validators/buyer';
import { getCurrentUser } from '@/src/lib/auth';
import { rateLimit } from '@/src/lib/rateLimit';

export async function GET(req: Request, { params }: any) {
  const id = params.id;
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const history = await prisma.buyerHistory.findMany({ where: { buyerId: id }, orderBy: { changedAt: 'desc' }, take: 5 });
  return NextResponse.json({ ...buyer, historyPreview: history });
}

export async function PATCH(req: Request, { params }: any) {
  const id = params.id;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  try { rateLimit(user.id); } catch(e:any) { return NextResponse.json({ error: e.message }, { status: 429 }); }

  const body = await req.json();
  const clientUpdatedAt = body.updatedAt;
  if (!clientUpdatedAt) return NextResponse.json({ error: 'updatedAt required for concurrency' }, { status: 400 });

  const parsed = createBuyerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const data = parsed.data;

  const original = await prisma.buyer.findUnique({ where: { id } });
  if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (original.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updated = await prisma.$transaction(async (tx) => {
    const count = await tx.buyer.count({ where: { id, updatedAt: new Date(clientUpdatedAt) } });
    if (count === 0) return null;
    const before = original;
    const b = await tx.buyer.update({
      where: { id },
      data: { ...data }
    });
    await tx.buyerHistory.create({
      data: { buyerId: id, changedBy: user.id, diff: { before, after: data } }
    });
    return b;
  });

  if (!updated) return NextResponse.json({ error: 'Record changed, please refresh' }, { status: 409 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  const id = params.id;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const original = await prisma.buyer.findUnique({ where: { id } });
  if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (original.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.buyer.delete({ where: { id } });
  await prisma.buyerHistory.create({ data: { buyerId: id, changedBy: user.id, diff: { deleted: true } } });
  return NextResponse.json({ ok: true });
}
