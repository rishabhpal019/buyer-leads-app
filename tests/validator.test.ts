import { createBuyerSchema } from '../src/lib/validators/buyer';

test('budgetMax must be >= budgetMin', () => {
  const input = {
    fullName: 'Test User',
    phone: '9876543210',
    city: 'Chandigarh',
    propertyType: 'Plot',
    purpose: 'Buy',
    timeline: '0-3m',
    source: 'Website',
    budgetMin: 500000,
    budgetMax: 400000
  };
  const parsed = createBuyerSchema.safeParse(input);
  expect(parsed.success).toBe(false);
});
