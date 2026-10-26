'use client';

/**
 * Όριο σφάλματος για όλη την πλατφόρμα.
 *
 * ΓΙΑΤΙ ΥΠΑΡΧΕΙ: χωρίς αυτό, ένα σφάλμα σε server component κατά τη ΔΙΑΡΚΕΙΑ
 * πλοήγησης δεν δείχνει τίποτα — ο χρήστης πατάει, η σελίδα δεν αλλάζει, και
 * δεν υπάρχει κανένα μήνυμα. «Κάνω κλικ και δεν γίνεται τίποτα» είναι ακριβώς
 * αυτή η εικόνα. Ένα σφάλμα που δεν φαίνεται είναι χειρότερο από ένα σφάλμα.
 */
export default function AppError({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  /* Client component χωρίς props από τον server: η γλώσσα διαβάζεται από το
     `<html lang>`, που το γράφει ο server. */
  const en = typeof document !== 'undefined' && document.documentElement.lang === 'en';
  return (
    <div className="errbox">
      <b>{en ? 'Something broke on this page.' : 'Κάτι χάλασε σε αυτή τη σελίδα.'}</b>
      <p>{error.message || (en ? 'Unknown error.' : 'Άγνωστο σφάλμα.')}</p>
      {error.digest && <code>{en ? 'Code' : 'Κωδικός'}: {error.digest}</code>}
      <div className="fm-row" style={{ marginTop: 16 }}>
        <button className="btn btn-solid btn-sm" onClick={reset} type="button">{en ? 'Try again' : 'Δοκίμασε ξανά'}</button>
        <a className="btn btn-line btn-sm" href="/app">{en ? 'Home' : 'Αρχική'}</a>
      </div>
    </div>
  );
}
