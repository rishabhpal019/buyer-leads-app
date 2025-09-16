import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { createBuyerSchema } from '@/src/lib/validators/buyer';
import { getCurrentUser, demoLoginHeaders } from '@/src/lib/auth';
import { rateLimit } from '@/src/lib/rateLimit';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const page = Number(url.searchParams.get('page') || '1');
  const PAGE = 10;
  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } }
    ];
  }
  const [total, buyers] = await prisma.$transaction([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page-1)*PAGE, take: PAGE })
  ]);
  return NextResponse.json({ total, buyers });
}

export async function POST(req: Request) {
  // demo: allow demo login by setting cookie when ?demo=1
  const u = await getCurrentUser();
  if (!u) {
    // return a response that instructs client to set demo cookie
    return NextResponse.json({ error: 'not authenticated (use demo login)' }, { status: 401, headers: demoLoginHeaders() });
  }
  try {
    rateLimit(u.id);
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 429 });
  }
  const body = await req.json();
  const parsed = createBuyerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const data = parsed.data;
  const created = await prisma.$transaction(async (tx) => {
    const b = await tx.buyer.create({ data: { ...data, ownerId: u.id } });
    await tx.buyerHistory.create({ data: { buyerId: b.id, changedBy: u.id, diff: { created: data } } });
    return b;
  });
  return NextResponse.json(created);
}
