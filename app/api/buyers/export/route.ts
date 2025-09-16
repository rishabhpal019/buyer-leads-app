import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } }
    ];
  }
  const buyers = await prisma.buyer.findMany({ where, orderBy: { updatedAt: 'desc' } });
  const rows = buyers.map(b => ({
    fullName: b.fullName, email: b.email||'', phone: b.phone, city: b.city, propertyType: b.propertyType, bhk: b.bhk||'', purpose: b.purpose, budgetMin: b.budgetMin||'', budgetMax: b.budgetMax||'', timeline: b.timeline, source: b.source, notes: b.notes||'', tags: (b.tags||[]).join(';'), status: b.status
  }));
  const csv = Papa.unparse(rows);
  return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="buyers.csv"' } });
}
