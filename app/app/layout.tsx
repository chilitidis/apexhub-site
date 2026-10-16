import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf } from '@/lib/academy';
import AppSidebar from '@/components/AppSidebar';
import Crumbs from '@/components/Crumbs';
import './app.css';

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
    <div className="shell">
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
