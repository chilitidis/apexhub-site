/**
 * Το δαχτυλίδι προόδου.
 *
 * ΓΙΑΤΙ SVG ΚΑΙ ΟΧΙ `conic-gradient`: το conic-gradient δίνει γεμάτη πίτα, όχι
 * δαχτυλίδι με στρογγυλεμένες άκρες, και η βαθμίδα πάνω του δεν ακολουθεί την
 * καμπύλη. Εδώ ο χρυσός τρέχει κατά μήκος του τόξου, όπως σε χαραγμένο μέταλλο.
 *
 * ΔΕΝ ΕΙΝΑΙ CLIENT COMPONENT. Είναι καθαρό markup: ο server ξέρει ήδη το
 * ποσοστό, και ένα δαχτυλίδι που «γεμίζει» με animation στο load θα τραβούσε
 * το βλέμμα κάθε φορά που ανοίγει η αρχική — μια φορά είναι εντύπωση, δέκα
 * φορές είναι ενόχληση.
 */
export default function ProgressRing({
  value, total, size = 132, stroke = 6,
}: { value: number; total: number; size?: number; stroke?: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  /* Στο 0% το τόξο πρέπει να είναι ΑΚΡΙΒΩΣ μηδέν. Με στρογγυλεμένη άκρη, ένα
     dash μήκους 0.0001 ζωγραφίζει μια κουκκίδα που μοιάζει με σφάλμα. */
  const dash = pct > 0 ? (c * pct) / 100 : 0;

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E6C873" />
            <stop offset="1" stopColor="#A87B2A" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        {dash > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                  stroke="url(#ringGold)" strokeWidth={stroke} strokeLinecap="round"
                  strokeDasharray={`${dash} ${c - dash}`}
                  /* Ξεκινά από τις 12 η ώρα, όχι από τις 3. */
                  transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        )}
      </svg>
      <div className="ring-in">
        <b className="num">{pct}<i>%</i></b>
        <span className="num">{value}/{total}</span>
      </div>
    </div>
  );
}
