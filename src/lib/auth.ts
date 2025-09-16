import { prisma } from './prisma';
import { parse as parseCookie, serialize } from 'cookie';
import { NextRequest } from 'next/server';

const DEMO_USER = { id: 'demo-user-1', email: 'demo@example.com', name: 'Demo User' };

export async function getCurrentUser(req?: NextRequest | undefined) {
  // naive demo: if cookie 'demo_user' present, return demo user
  try {
    const cookieHeader = req ? req.headers.get('cookie') ?? '' : (typeof document !== 'undefined' ? document.cookie : '');
    const cookies = parseCookie(cookieHeader || '');
    if (cookies.demo_user === '1') {
      // ensure user exists in DB
      await prisma.user.upsert({
        where: { email: DEMO_USER.email },
        update: {},
        create: { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name }
      });
      return DEMO_USER;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function demoLoginHeaders() {
  return {
    'Set-Cookie': serialize('demo_user', '1', { path: '/', httpOnly: true })
  };
}
