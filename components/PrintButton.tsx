'use client';

/**
 * «Κατέβασέ το» = εκτύπωση του browser.
 *
 * ΓΙΑΤΙ ΟΧΙ ΠΑΡΑΓΩΓΗ PDF ΣΤΟΝ SERVER: θα χρειαζόταν headless browser μέσα σε
 * serverless function για ένα χαρτί που ο χρήστης βλέπει ήδη στην οθόνη του.
 * Το dialog εκτύπωσης κάθε browser γράφει PDF, και το `@media print` στο CSS
 * ήδη κρατάει μόνο το πιστοποιητικό στη σελίδα.
 */
export default function PrintButton({ label = 'Κατέβασέ το' }: { label?: string }) {
  return (
    <button type="button" className="gold-btn" onClick={() => window.print()}>
      {label}
    </button>
  );
}
