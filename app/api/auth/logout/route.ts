import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, cookieDomain } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* POST, όχι GET: ένα <img src="/api/auth/logout"> σε οποιαδήποτε σελίδα θα
   έβγαζε τον χρήστη έξω χωρίς να το καταλάβει. */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', new URL(req.url).origin), 303);
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true, path: '/', maxAge: 0, domain: cookieDomain(),
  });
  return res;
}
