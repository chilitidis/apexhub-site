import type { Metadata } from 'next';
import { Noto_Serif_Display } from 'next/font/google';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf } from '@/lib/academy';
import AppSidebar from '@/components/AppSidebar';
import Crumbs from '@/components/Crumbs';
import './app.css';

/**
 * Η SERIF ΤΩΝ ΤΙΤΛΩΝ.
 *
 * ΓΙΑΤΙ `next/font` ΚΑΙ ΟΧΙ `<link>` ΣΤΟ ROOT LAYOUT: το root layout σερβίρει
 * και τη δημόσια σελίδα, που δεν χρησιμοποιεί serif. Εδώ η γραμματοσειρά
 * κατεβαίνει μόνο για την πλατφόρμα, φιλοξενείται από το ίδιο μας το domain
 * (ένα round-trip λιγότερο, κανένα αίτημα στην Google από τον χρήστη) και το
 * Next κρατά χώρο για το κείμενο ώστε να μην «πηδάει» η σελίδα στο load.
 *
 * ΤΟ `greek` SUBSET ΔΕΝ ΕΙΝΑΙ ΠΡΟΑΙΡΕΤΙΚΟ. Χωρίς αυτό ο browser κατεβάζει τη
 * serif, δεν βρίσκει μέσα της ελληνικά γράμματα και πέφτει σιωπηλά στη
 * Georgia — δηλαδή όλη η δουλειά της τυπογραφίας πάει χαμένη και φαίνεται
 * μόνο σε όποιον ξέρει τι κοιτάζει.
 *
 * Βάρος 400 μόνο: οι τίτλοι είναι μεγάλοι και ελαφριοί. Ένα bold serif σε
 * 52px δεν διαβάζεται ως πολυτέλεια, διαβάζεται ως εφημερίδα.
 */
const serif = Noto_Serif_Display({
  subsets: ['greek', 'latin'],
  weight: ['400'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-serif',
});

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Πλατφόρμα μελών — APEXHUB',
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = currentSession();
  if (!s) redirect('/login');

  const v = await viewerOf(s.tid);

  /* Το πακέτο κάτω από το όνομα. Ο διαχειριστής είναι και μέλος· δείχνουμε
     τη μεγαλύτερη ιδιότητα, όχι λίστα. Μία λέξη: μπαίνει σε χρυσό label και
     ένα «Elite μέλος» σε δύο σειρές δεν είναι πια label, είναι πρόταση. */
  const role = v.admin ? 'Διαχειριση' : v.tiers.has('elite') ? 'Elite' : 'VIP';

  return (
    <div className={`shell ${serif.variable}`}>
      <AppSidebar
        name={s.name}
        role={role}
        photo={s.photo}
        isAdmin={v.admin}
        isPartner={v.partner}
        journalUrl={process.env.NEXT_PUBLIC_JOURNAL_URL ?? 'https://ultimatradingjournal.com'}
        portalUrl={process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://portal.apexhub.gr'}
      />
      <div className="shell-main">
        <Crumbs />
        <main className="shell-body">{children}</main>
      </div>
    </div>
  );
}
