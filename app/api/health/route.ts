import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Έλεγχος υγείας.
 *
 * Επιστρέφει ΜΟΝΟ ναι/όχι: ποιες ρυθμίσεις υπάρχουν και αν απαντάει η βάση.
 * Καμία τιμή, κανένα κλειδί, κανένα δεδομένο μέλους. Υπάρχει για να μπορεί
 * κάποιος να δει σε δέκα δευτερόλεπτα τι λείπει, χωρίς να ψάχνει στα logs.
 */
export async function GET() {
  const env = {
    SUPABASE_URL:  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_KEY:  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SESSION_SECRET: Boolean(process.env.APEX_SESSION_SECRET),
    BOT_TOKEN:     Boolean(process.env.TELEGRAM_BOT_TOKEN),
    BOT_USERNAME:  Boolean(process.env.NEXT_PUBLIC_BOT_USERNAME),
    VIP_CHAT_ID:   Boolean(process.env.TELEGRAM_VIP_CHAT_ID),
  };

  let database = 'δεν δοκιμάστηκε';
  let courses: number | null = null;
  try {
    const { count, error } = await db()
      .from('courses').select('id', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    database = 'ok';
    courses = count ?? 0;
  } catch (e) {
    database = `σφάλμα: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({ env, database, courses });
}
