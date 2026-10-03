/**
 * Η συνεδρία του δημόσιου site.
 *
 * ΓΙΑΤΙ ΔΙΚΗ ΤΗΣ, ΚΑΙ ΟΧΙ SUPABASE: εδώ δεν υπάρχει λογαριασμός. Ο χρήστης δεν
 * έχει email ούτε κωδικό — η ταυτότητά του είναι το Telegram ID του, και η
 * άδεια εισόδου είναι το ότι βρίσκεται μέσα στην ομάδα. Ένας πίνακας χρηστών
 * θα ήταν δεύτερη πηγή αλήθειας για κάτι που το ξέρει ήδη το Telegram.
 *
 * Το cookie είναι υπογεγραμμένο, όχι κρυπτογραφημένο: το περιεχόμενό του το
 * βλέπει ο κάτοχός του, αλλά δεν μπορεί να το αλλάξει χωρίς το μυστικό. Δεν
 * κρατάμε τίποτα ευαίσθητο μέσα — μόνο ποιος είναι και πότε λήγει.
 *
 * Μπαίνει στο `.apexhub.gr` ώστε να είναι ορατό και στο portal. ΠΡΟΣΟΧΗ: αυτό
 * ΔΕΝ είναι single sign-on. Το back office έχει δική του σύνδεση με Supabase
 * και δεν ξέρει να διαβάζει αυτό το cookie. Το βάζουμε εκεί για να είναι
 * εφικτό το SSO αργότερα, όχι επειδή δουλεύει ήδη.
 */
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './cookie';

export { SESSION_COOKIE };
const MAX_AGE = 60 * 60 * 24 * 30; // 30 ημέρες

export interface Session {
  /** Telegram ID — η ταυτότητα */
  tid: number;
  /** Όνομα για χαιρετισμό */
  name: string;
  username?: string;
  photo?: string;
  /** Πότε λήγει, σε δευτερόλεπτα epoch */
  exp: number;
}

function secret(): string {
  const s = process.env.APEX_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('Λείπει ή είναι πολύ κοντό το APEX_SESSION_SECRET (>= 32 χαρακτήρες).');
  }
  return s;
}

const b64 = (b: Buffer) => b.toString('base64url');

export function sign(payload: Omit<Session, 'exp'>): { value: string; maxAge: number } {
  const body: Session = { ...payload, exp: Math.floor(Date.now() / 1000) + MAX_AGE };
  const data = b64(Buffer.from(JSON.stringify(body)));
  const mac = b64(crypto.createHmac('sha256', secret()).update(data).digest());
  return { value: `${data}.${mac}`, maxAge: MAX_AGE };
}

export function verify(token: string | undefined): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;

  const data = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = b64(crypto.createHmac('sha256', secret()).update(data).digest());

  /* Σύγκριση σταθερού χρόνου: μια απλή `!==` διαρρέει πόσοι χαρακτήρες
     ταίριαξαν, και αυτό αρκεί για να μαντέψει κάποιος την υπογραφή byte-byte. */
  if (expected.length !== mac.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null;

  try {
    const s = JSON.parse(Buffer.from(data, 'base64url').toString()) as Session;
    if (!s?.tid || !s.exp || s.exp < Math.floor(Date.now() / 1000)) return null;
    return s;
  } catch {
    return null;
  }
}

/** Η τρέχουσα συνεδρία, ή null. Για server components. */
export function currentSession(): Session | null {
  try {
    return verify(cookies().get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

/**
 * Το domain του cookie. Σε παραγωγή `.apexhub.gr` ώστε να ισχύει και στα
 * subdomains· τοπικά κανένα, γιατί ο browser απορρίπτει cookie με domain που
 * δεν ταιριάζει με το localhost και η σύνδεση θα αποτύγχανε σιωπηλά.
 */
export function cookieDomain(): string | undefined {
  return process.env.NODE_ENV === 'production' ? '.apexhub.gr' : undefined;
}
