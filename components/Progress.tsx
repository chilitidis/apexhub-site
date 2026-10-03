'use client';

import { useEffect, useState } from 'react';

/**
 * Πρόοδος μαθημάτων.
 *
 * Ζει στον browser του κάθε μέλους, όχι σε βάση. Αυτό είναι συνειδητή επιλογή
 * για αυτό το στάδιο: δεν υπάρχει ακόμη περιεχόμενο, άρα δεν υπάρχει πρόοδος
 * να χαθεί — ενώ ένας πίνακας θα απαιτούσε service role key μέσα στο δημόσιο
 * site, δηλαδή ένα κλειδί που διαβάζει τα πάντα, μέχρι και τις προμήθειες.
 *
 * ΤΟ ΤΙΜΗΜΑ, καθαρά: η πρόοδος χάνεται αν αλλάξεις συσκευή ή καθαρίσεις τον
 * browser. Όταν μπουν τα βίντεο, μεταφέρεται σε πίνακα δεμένο με το Telegram ID.
 */
const KEY = 'apex_academy_done';

function read(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

function write(s: Set<string>) {
  try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* private mode */ }
}

export function DoneToggle({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => { setDone(read().has(slug)); setReady(true); }, [slug]);

  const toggle = () => {
    const s = read();
    if (s.has(slug)) s.delete(slug); else s.add(slug);
    write(s);
    setDone(s.has(slug));
    window.dispatchEvent(new Event('apex-progress'));
  };

  /* Μέχρι να διαβαστεί το localStorage δεν ξέρουμε την κατάσταση. Δείχνοντας
     «ολοκληρώθηκε» και διορθώνοντας μετά, θα τρεμόπαιζε σε κάθε φόρτωση. */
  if (!ready) return <span className="done-btn ghost" aria-hidden />;

  return (
    <button className={done ? 'done-btn on' : 'done-btn'} onClick={toggle} type="button">
      {done ? '✓ Ολοκληρώθηκε' : 'Σήμανση ως ολοκληρωμένο'}
    </button>
  );
}

export function SectionProgress({ slugs }: { slugs: string[] }) {
  const [n, setN] = useState(0);
  const [ready, setReady] = useState(false);

  /* Η εξάρτηση είναι ΣΥΜΒΟΛΟΣΕΙΡΑ, όχι ο πίνακας. Ένας πίνακας-prop είναι νέο
     αντικείμενο σε κάθε render του γονιού· ως εξάρτηση θα ξανάστηνε τον
     ακροατή ασταμάτητα. Το ίδιο λάθος κρέμασε ολόκληρη την πλατφόρμα μία φορά. */
  const key = slugs.join('|');

  useEffect(() => {
    const list = key ? key.split('|') : [];
    const calc = () => { const s = read(); setN(list.filter((x) => s.has(x)).length); setReady(true); };
    calc();
    window.addEventListener('apex-progress', calc);
    return () => window.removeEventListener('apex-progress', calc);
  }, [key]);

  if (!ready) return null;
  return (
    <div className="prog">
      <div className="bar"><span style={{ width: `${(n / slugs.length) * 100}%` }} /></div>
      <span className="cnt">{n}/{slugs.length}</span>
    </div>
  );
}
