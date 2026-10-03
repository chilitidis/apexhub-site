import 'server-only';
import { db } from './db';
import { currentSession } from './session';
import { viewerOf } from './academy';

/**
 * =============================================================================
 * Διαχείριση περιεχομένου — ο φύλακας και οι πράξεις
 * =============================================================================
 *
 * ΚΑΘΕ πράξη περνάει από το `requireAdmin()`. Δεν αρκεί να μη φαίνεται το
 * admin panel στο μενού: οι server actions είναι HTTP endpoints σαν όλα τα
 * άλλα, και όποιος ξέρει το όνομά τους μπορεί να τα καλέσει.
 */
export async function requireAdmin() {
  const s = currentSession();
  if (!s) throw new Error('Δεν είσαι συνδεδεμένος.');
  const v = await viewerOf(s.tid);
  if (!v.admin) throw new Error('Δεν έχεις δικαίωμα διαχείρισης.');
  return { session: s, viewer: v };
}

export const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[άΆ]/g, 'α').replace(/[έΈ]/g, 'ε').replace(/[ήΉ]/g, 'η')
    .replace(/[ίΊϊΐ]/g, 'ι').replace(/[όΌ]/g, 'ο').replace(/[ύΎϋΰ]/g, 'υ')
    .replace(/[ώΏ]/g, 'ω')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'x';

/**
 * Το Vimeo δίνει το ίδιο βίντεο με πέντε μορφές συνδέσμου. Ο χρήστης
 * επικολλά ό,τι έχει· εμείς κρατάμε μόνο το ID.
 *   https://vimeo.com/123456789
 *   https://vimeo.com/123456789/abcdef0123       (ιδιωτικό hash)
 *   https://player.vimeo.com/video/123456789
 *   123456789
 */
export function vimeoId(input: string): string | null {
  const s = (input ?? '').trim();
  if (!s) return null;
  if (/^\d{6,}$/.test(s)) return s;
  const m = s.match(/vimeo\.com\/(?:video\/)?(\d{6,})(?:\/([a-zA-Z0-9]+))?/);
  if (!m) return null;
  /* Το hash ιδιωτικού βίντεο είναι μέρος της διεύθυνσης αναπαραγωγής· χωρίς
     αυτό ο player γυρίζει «Private video». Το κρατάμε κολλημένο με «:». */
  return m[2] ? `${m[1]}:${m[2]}` : m[1];
}

/** Από το αποθηκευμένο «id» ή «id:hash» στη διεύθυνση του player. */
export function vimeoSrc(stored: string): string {
  const [id, hash] = stored.split(':');
  const p = new URLSearchParams({
    color: 'E9C45C', title: '0', byline: '0', portrait: '0', dnt: '1',
  });
  if (hash) p.set('h', hash);
  return `https://player.vimeo.com/video/${id}?${p.toString()}`;
}

/** Ανέβασμα αρχείου στην αποθήκη. Επιστρέφει δημόσια διεύθυνση. */
export async function upload(file: File, prefix: string): Promise<string> {
  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error } = await db().storage.from('academy')
    .upload(key, buf, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (error) throw new Error(`Το ανέβασμα απέτυχε: ${error.message}`);

  const { data } = db().storage.from('academy').getPublicUrl(key);
  return data.publicUrl;
}
