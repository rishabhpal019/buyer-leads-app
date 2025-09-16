import Papa from 'papaparse';
import { createBuyerSchema } from '../src/lib/validators/buyer';

test('csv parse and validate rows', () => {
  const csv = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
Test User,test@example.com,9876500000,Chandigarh,Apartment,1,Buy,1000000,2000000,0-3m,Website,Note,"tag1;tag2",New`;
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const rows = parsed.data as any[];
  expect(rows.length).toBe(1);
  const r = rows[0];
  const mapped = {
    fullName: r.fullName, email: r.email, phone: r.phone, city: r.city, propertyType: r.propertyType, bhk: r.bhk, purpose: r.purpose,
    budgetMin: r.budgetMin ? Number(r.budgetMin) : undefined, budgetMax: r.budgetMax ? Number(r.budgetMax) : undefined,
    timeline: r.timeline, source: r.source, notes: r.notes, tags: r.tags ? String(r.tags).split(';').map((s:string)=>s.trim()).filter(Boolean):[]
  };
  const p = createBuyerSchema.safeParse(mapped);
  expect(p.success).toBe(true);
});
