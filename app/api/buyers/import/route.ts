import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { prisma } from '@/src/lib/prisma';
import { createBuyerSchema } from '@/src/lib/validators/buyer';
import { getCurrentUser } from '@/src/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const txt = await req.text();
  const parsed = Papa.parse(txt, { header: true, skipEmptyLines: true });
  const rows = parsed.data as any[];
  if (rows.length > 200) return NextResponse.json({ error: 'Max 200 rows allowed' }, { status: 400 });
  const errors: Array<{ row:number; message:string }> = [];
  const valids: any[] = [];
  rows.forEach((r, idx) => {
    const mapped = {
      fullName: (r.fullName||'').trim(),
      email: (r.email||'').trim() || undefined,
      phone: (r.phone||'').trim(),
      city: (r.city||'Chandigarh').trim(),
      propertyType: (r.propertyType||'Apartment').trim(),
      bhk: r.bhk || undefined,
      purpose: (r.purpose||'Buy').trim(),
      budgetMin: r.budgetMin ? Number(r.budgetMin) : undefined,
      budgetMax: r.budgetMax ? Number(r.budgetMax) : undefined,
      timeline: (r.timeline||'0-3m').trim(),
      source: (r.source||'Website').trim(),
      notes: r.notes || undefined,
      tags: r.tags ? String(r.tags).split(';').map((s:string)=>s.trim()).filter(Boolean) : []
    };
    const p = createBuyerSchema.safeParse(mapped);
    if (!p.success) {
      errors.push({ row: idx+2, message: JSON.stringify(p.error.format()) });
    } else {
      valids.push(p.data);
    }
  });
  if (errors.length) {
    return NextResponse.json({ errors, inserted:0 });
  }
  // insert in transaction
  await prisma.$transaction(async (tx) => {
    for (const r of valids) {
      const b = await tx.buyer.create({ data: { ...r, ownerId: user.id } });
      await tx.buyerHistory.create({ data: { buyerId: b.id, changedBy: user.id, diff: { created: r } } });
    }
  });
  return NextResponse.json({ errors:[], inserted: valids.length });
}
