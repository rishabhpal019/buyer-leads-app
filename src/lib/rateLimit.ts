const map = new Map<string, { count: number; reset: number }>();
const WINDOW = 60 * 1000; // 1 minute
const MAX = 30;

export function rateLimit(userId: string) {
  const now = Date.now();
  const r = map.get(userId);
  if (!r || r.reset < now) {
    map.set(userId, { count: 1, reset: now + WINDOW });
    return;
  }
  if (r.count >= MAX) {
    throw new Error('Too many requests');
  }
  r.count++;
}
