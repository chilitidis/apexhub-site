/**
 * =============================================================================
 * Γλώσσα: ελληνικά ή αγγλικά
 * =============================================================================
 *
 * Η γλώσσα ζει σε ένα cookie (`lang`), όχι στη διεύθυνση. Οι διευθύνσεις των
 * μαθημάτων κυκλοφορούν ήδη σε μηνύματα και σελιδοδείκτες· ένα `/en/...`
 * μπροστά θα τις έσπαγε ή θα χρειαζόταν δεύτερο σετ redirects.
 *
 * Προεπιλογή τα ελληνικά. Το κουμπί EL/EN γράφει το cookie και κάνει
 * refresh — ο server αποδίδει ξανά τη σελίδα στη νέα γλώσσα.
 *
 * ΤΟ ΠΕΡΙΕΧΟΜΕΝΟ ΤΗΣ ΒΑΣΗΣ: κάθε πεδίο έχει δίδυμο `<πεδίο>_en`. Αν το
 * αγγλικό λείπει (π.χ. νέο μάθημα που δεν μεταφράστηκε ακόμη), φαίνεται το
 * ελληνικό. Καλύτερα ένα ελληνικό μάθημα παρά ένα άδειο.
 */
export type Lang = 'el' | 'en';
export const LANG_COOKIE = 'lang';

export function asLang(v: string | undefined | null): Lang {
  return v === 'en' ? 'en' : 'el';
}

/** Locale για ημερομηνίες. */
export const LOCALE: Record<Lang, string> = { el: 'el-GR', en: 'en-GB' };

/**
 * Αντικαθιστά τα πεδία με τα αγγλικά τους δίδυμα, όπου υπάρχουν.
 * Επιστρέφει νέο αντικείμενο· τα `_en` πεδία μένουν όπως ήταν.
 */
export function loc<T extends object>(row: T, lang: Lang, fields: string[]): T {
  if (lang !== 'en' || !row) return row;
  const r = row as Record<string, unknown>;
  const out: Record<string, unknown> = { ...r };
  for (const f of fields) {
    const en = r[`${f}_en`];
    if (en !== null && en !== undefined && en !== '') out[f] = en;
  }
  return out as T;
}
