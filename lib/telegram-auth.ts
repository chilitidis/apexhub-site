/**
 * Επαλήθευση Telegram Login Widget.
 *
 * Αντίγραφο της ίδιας λογικής που ζει στο back office. Το κρατάω αντιγραμμένο
 * αντί να φτιάξω κοινό πακέτο επειδή οι δύο εφαρμογές πρέπει να μπορούν να
 * αναπτύσσονται ανεξάρτητα — ένα κοινό πακέτο θα έδενε την κάθε αλλαγή του
 * δημόσιου site με build του back office. Είναι 60 γραμμές και η προδιαγραφή
 * του Telegram δεν αλλάζει.
 *
 *   secret_key        = SHA256(bot_token)
 *   data_check_string = όλα τα πεδία εκτός `hash`, ταξινομημένα, "k=v", με \n
 *   hash              = HMAC_SHA256(data_check_string, secret_key)
 *
 * core.telegram.org/widgets/login
 */
import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
}

/** Το Telegram συνιστά 24 ώρες. */
const MAX_AGE_SECONDS = 86400;

export function verifyTelegramAuth(
  data: Record<string, unknown>,
  botToken: string,
  now: number = Date.now(),
): { ok: true; user: TelegramUser } | { ok: false; reason: string } {
  if (!botToken) return { ok: false, reason: 'Λείπει το TELEGRAM_BOT_TOKEN.' };

  const hash = typeof data.hash === 'string' ? data.hash : '';
  if (!hash) return { ok: false, reason: 'Λείπει η υπογραφή.' };

  const id = Number(data.id);
  const authDate = Number(data.auth_date);
  if (!Number.isFinite(id) || !Number.isFinite(authDate)) {
    return { ok: false, reason: 'Ελλιπή στοιχεία.' };
  }

  const age = now / 1000 - authDate;
  if (age > MAX_AGE_SECONDS) return { ok: false, reason: 'Η σύνδεση έληξε. Δοκίμασε ξανά.' };
  // Αρνητική ηλικία = χρονοσήμανση στο μέλλον. Ανοχή 5 λεπτών για ρολόγια.
  if (age < -300) return { ok: false, reason: 'Μη έγκυρη χρονοσήμανση.' };

  const checkString = Object.keys(data)
    .filter((k) => k !== 'hash' && data[k] !== undefined && data[k] !== null)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const expected = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (expected.length !== hash.length) return { ok: false, reason: 'Μη έγκυρη υπογραφή.' };
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash))) {
    return { ok: false, reason: 'Μη έγκυρη υπογραφή.' };
  }

  return {
    ok: true,
    user: {
      id,
      auth_date: authDate,
      first_name: typeof data.first_name === 'string' ? data.first_name : undefined,
      last_name:  typeof data.last_name  === 'string' ? data.last_name  : undefined,
      username:   typeof data.username   === 'string' ? data.username   : undefined,
      photo_url:  typeof data.photo_url  === 'string' ? data.photo_url  : undefined,
    },
  };
}

/**
 * Είναι μέσα στην ομάδα;
 *
 * Αυτή είναι η πύλη. Το Telegram δεν δίνει API που να λέει «σε ποια γκρουπ
 * ανήκει ο χρήστης Χ» — δίνει μόνο το αντίστροφο: «ποια είναι η κατάσταση του
 * χρήστη Χ ΣΕ ΑΥΤΟ το chat», και μόνο όπου ο bot είναι διαχειριστής.
 *
 * Οι καταστάσεις που μετράνε ως «μέσα»: member, administrator, creator. Το
 * `restricted` μετράει μόνο αν ο χρήστης είναι ακόμη μέλος (is_member) — κάποιος
 * σε σίγαση εξακολουθεί να ανήκει. Τα `left` και `kicked` είναι έξω.
 */
export async function isGroupMember(
  telegramId: number,
  botToken: string,
  chatId: string,
): Promise<{ ok: true; member: boolean } | { ok: false; reason: string }> {
  if (!botToken || !chatId) return { ok: false, reason: 'Λείπει ρύθμιση Telegram.' };

  let res: Response;
  try {
    res = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember`
      + `?chat_id=${encodeURIComponent(chatId)}&user_id=${telegramId}`,
      { cache: 'no-store' },
    );
  } catch {
    return { ok: false, reason: 'Δεν ήταν δυνατή η επικοινωνία με το Telegram.' };
  }

  const body = (await res.json().catch(() => null)) as
    | { ok?: boolean; result?: { status?: string; is_member?: boolean }; description?: string }
    | null;

  if (!body?.ok || !body.result) {
    /* Το «user not found» σημαίνει ότι ο χρήστης δεν ήταν ΠΟΤΕ στην ομάδα —
       απάντηση, όχι σφάλμα. Οτιδήποτε άλλο είναι δικό μας πρόβλημα και δεν
       πρέπει να το περάσουμε για «δεν είσαι μέλος». */
    const d = body?.description ?? '';
    if (/user not found/i.test(d)) return { ok: true, member: false };
    return { ok: false, reason: d || 'Το Telegram δεν απάντησε.' };
  }

  const st = body.result.status;
  const inside =
    st === 'member' || st === 'administrator' || st === 'creator'
    || (st === 'restricted' && body.result.is_member === true);

  return { ok: true, member: inside };
}
