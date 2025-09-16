import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';

const PAGE_SIZE = 10;

export default async function BuyersPage({ searchParams }: any) {
  const page = Number(searchParams?.page ?? 1);
  const where: any = {};
  const q = (searchParams?.q || '').trim();
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } }
    ];
  }
  const [total, buyers] = await prisma.$transaction([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page-1)*PAGE_SIZE,
      take: PAGE_SIZE
    })
  ]);
  return (
    <div>
      <h2>Buyers</h2>
      <form method="get">
        <input name="q" defaultValue={q} placeholder="Search name/phone/email" />
        <button>Search</button>
      </form>
      <Link href="/buyers/new">+ New Lead</Link>
      <table border={1} cellPadding={6} style={{ marginTop: 12 }}>
        <thead><tr><th>Name</th><th>Phone</th><th>City</th><th>Property</th><th>Budget</th><th>Updated</th><th>Actions</th></tr></thead>
        <tbody>
          {buyers.map(b => (
            <tr key={b.id}>
              <td>{b.fullName}</td>
              <td>{b.phone}</td>
              <td>{b.city}</td>
              <td>{b.propertyType}</td>
              <td>{b.budgetMin ?? '-'} - {b.budgetMax ?? '-'}</td>
              <td>{new Date(b.updatedAt).toLocaleString()}</td>
              <td><Link href={`/buyers/${b.id}`}>View / Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12 }}>
        Page: {page} / {Math.ceil(total / PAGE_SIZE)}
        {page>1 && <Link href={`?page=${page-1}`}> Prev</Link>}
        {page*PAGE_SIZE < total && <Link href={`?page=${page+1}`}> Next</Link>}
      </div>
    </div>
  );
}
