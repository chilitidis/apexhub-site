import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/cookie';

/**
 * Φύλακας της περιοχής μελών.
 *
 * Εδώ ελέγχουμε ΜΟΝΟ την ύπαρξη του cookie, όχι την υπογραφή του: το
 * middleware τρέχει στο Edge runtime, όπου δεν υπάρχει το `crypto` του Node.
 * Η πραγματική επαλήθευση γίνεται στη σελίδα, που τρέχει σε Node. Το
 * middleware είναι ο πορτιέρης που γλιτώνει το ταξίδι, όχι η κλειδαριά.
 */
export function middleware(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  const to = new URL('/login', req.url);
  to.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(to);
}

export const config = { matcher: ['/members/:path*'] };
