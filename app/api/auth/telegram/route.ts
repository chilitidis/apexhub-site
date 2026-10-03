import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramAuth, isGroupMember } from '@/lib/telegram-auth';
import { sign, SESSION_COOKIE, cookieDomain } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Η πόρτα.
 *
 * Δύο έλεγχοι, με αυτή τη σειρά, και κανένας δεν παραλείπεται:
 *   1. Είναι αλήθεια αυτός ο άνθρωπος; → υπογραφή του Telegram
 *   2. Έχει δικαίωμα να μπει;         → είναι μέσα στο VIP group
 *
 * Το δεύτερο χωρίς το πρώτο δεν σημαίνει τίποτα: οποιοσδήποτε θα μπορούσε να
 * στείλει `?id=<το ID ενός μέλους>` και να περάσει.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fail = (msg: string) =>
    NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, url.origin));

  const data: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { data[k] = v; });

  const auth = verifyTelegramAuth(data, process.env.TELEGRAM_BOT_TOKEN ?? '');
  if (!auth.ok) return fail(auth.reason);

  const gate = await isGroupMember(
    auth.user.id,
    process.env.TELEGRAM_BOT_TOKEN ?? '',
    process.env.TELEGRAM_VIP_CHAT_ID ?? '',
  );

  /* Αν το Telegram δεν απάντησε, ΔΕΝ λέμε «δεν είσαι μέλος». Ένα μέλος που
     ακούει ότι δεν ανήκει στην ομάδα του είναι χειρότερο από ένα «ξαναδοκίμασε». */
  if (!gate.ok) return fail('Δεν μπορέσαμε να επιβεβαιώσουμε τη συμμετοχή σου. Δοκίμασε ξανά σε λίγο.');
  if (!gate.member) return fail('not_member');

  const name = [auth.user.first_name, auth.user.last_name].filter(Boolean).join(' ')
    || auth.user.username || `#${auth.user.id}`;

  const { value, maxAge } = sign({
    tid: auth.user.id,
    name,
    username: auth.user.username,
    photo: auth.user.photo_url,
  });

  const res = NextResponse.redirect(new URL('/members', url.origin));
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
    domain: cookieDomain(),
  });
  return res;
}
