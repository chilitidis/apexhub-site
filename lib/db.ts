import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Η σύνδεση με τη βάση, ΜΟΝΟ από τον server.
 *
 * ΓΙΑΤΙ service role: η πλατφόρμα δεν έχει λογαριασμούς Supabase — η ταυτότητα
 * του μέλους είναι το Telegram ID μέσα στο δικό μας υπογεγραμμένο cookie. Το
 * RLS δεν μπορεί να δει αυτή την ταυτότητα, οπότε ο έλεγχος πρόσβασης γίνεται
 * εδώ, σε κώδικα που τρέχει αποκλειστικά στον server.
 *
 * ΤΟ ΤΙΜΗΜΑ, καθαρά: αυτό το κλειδί παρακάμπτει το RLS και διαβάζει τα πάντα,
 * μέχρι και τις προμήθειες. Γι' αυτό:
 *   · το `server-only` στην κορυφή κάνει το build να ΣΠΑΣΕΙ αν κάποιος
 *     εισάγει αυτό το αρχείο σε client component — όχι να διαρρεύσει σιωπηλά
 *   · κάθε ερώτημα ζει στο lib/academy.ts, με ρητά ονόματα πινάκων
 *   · καμία παράμετρος από τον χρήστη δεν γίνεται ποτέ όνομα πίνακα ή στήλης
 */
/**
 * ΤΥΠΟΙ: δεν παράγουμε types από τη βάση γι' αυτή την εφαρμογή. Το site
 * αγγίζει εννέα πίνακες από τους σαράντα τέσσερις, και ένα αρχείο τύπων για
 * ολόκληρο το σχήμα θα έπρεπε να ξαναπαράγεται σε κάθε migration του back
 * office — δηλαδή θα έσπαγε το build του site για αλλαγές που δεν το αφορούν.
 *
 * Αντ' αυτού, οι τύποι των γραμμών ζουν ρητά στο lib/academy.ts, δίπλα στα
 * ερωτήματα που τους χρησιμοποιούν. Εκεί μετράει η ακρίβεια.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createClient<any>> | null = null;

export function db() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Λείπουν NEXT_PUBLIC_SUPABASE_URL ή SUPABASE_SERVICE_ROLE_KEY.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client = createClient<any>(url, key, { auth: { persistSession: false } });
  return client;
}
