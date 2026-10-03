import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Η πλατφόρμα σου — APEXHUB',
  robots: { index: false, follow: false },
};

/**
 * Το σπίτι του μέλους.
 *
 * Σκοπός της σελίδας είναι να ΦΥΓΕΙ ο χρήστης από εδώ: δεν είναι προορισμός,
 * είναι διασταύρωση προς τα τέσσερα πράγματα που του ανήκουν. Γι' αυτό δεν
 * έχει στατιστικά, γραφήματα ή «καλωσόρισες» κείμενα — μόνο πόρτες.
 */
export default function Members() {
  const s = currentSession();
  // Το middleware έχει ήδη δει το cookie· εδώ ελέγχουμε την ΥΠΟΓΡΑΦΗ του.
  if (!s) redirect('/login');

  const journal = process.env.NEXT_PUBLIC_JOURNAL_URL ?? 'https://ultimatradingjournal.com';
  const portal = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://portal.apexhub.gr';
  const first = s.name.split(' ')[0];

  return (
    <main className="wrap hub">
      <header className="hub-top">
        <div>
          <div className="lbl kicker"><span>ΠΛΑΤΦΟΡΜΑ ΜΕΛΩΝ</span></div>
          <h1>Καλώς ήρθες, {first}.</h1>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="btn btn-line btn-sm" type="submit">Αποσύνδεση</button>
        </form>
      </header>

      <div className="doors">
        <a className="door lead" href="/members/academy">
          <div className="tp">Ακαδημία</div>
          <h3>Η εκπαίδευση, με σειρά</h3>
          <p>
            Από τις βάσεις μέχρι τη διαχείριση ρίσκου και την ψυχολογία. Κάθε
            ενότητα πατάει στην προηγούμενη και κρατάει την πρόοδό σου.
          </p>
          <span className="go">Είσοδος →</span>
        </a>

        {journal ? (
          <a className="door" href={journal} target="_blank" rel="noopener">
            <div className="tp">Εργαλείο</div>
            <h3>Ultimate Trading Journal</h3>
            <p>Καταγράφεις κάθε κίνηση και βλέπεις τα δικά σου μοτίβα.</p>
            <span className="go">Άνοιγμα →</span>
          </a>
        ) : (
          <div className="door off">
            <div className="tp">Εργαλείο</div>
            <h3>Ultimate Trading Journal</h3>
            <p>Συνδέεται σύντομα.</p>
          </div>
        )}

        <a className="door" href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">
          <div className="tp">Κοινότητα</div>
          <h3>Telegram</h3>
          <p>Η καθημερινή συζήτηση, τα trading ideas και τα live sessions.</p>
          <span className="go">Άνοιγμα →</span>
        </a>

        {/* Το back office είναι ΑΛΛΗ εφαρμογή με δική της σύνδεση. Το λέμε
            καθαρά αντί να αφήσουμε τον χρήστη να εκπλαγεί από οθόνη εισόδου. */}
        <a className="door" href={portal} target="_blank" rel="noopener">
          <div className="tp">Συνεργάτες</div>
          <h3>Back office</h3>
          <p>
            Προμήθειες, ομάδα και πληρωμές. Χρειάζεται ξεχωριστή σύνδεση με τον
            λογαριασμό συνεργάτη σου.
          </p>
          <span className="go">Άνοιγμα →</span>
        </a>
      </div>
    </main>
  );
}
