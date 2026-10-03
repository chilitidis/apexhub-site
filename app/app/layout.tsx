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

  /* Ο ρόλος που βλέπει ο χρήστης κάτω από το όνομά του. Ο διαχειριστής είναι
     και μέλος· δείχνουμε τη μεγαλύτερη ιδιότητα, όχι λίστα. */
  const role = v.admin ? 'Διαχειριστής' : v.tiers.has('elite') ? 'Elite μέλος' : 'Μέλος';

  return (
    <div className="shell">
      <AppSidebar
        name={s.name}
        role={role}
        photo={s.photo}
        isAdmin={v.admin}
        isPartner
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
