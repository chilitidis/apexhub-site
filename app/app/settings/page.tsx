import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf } from '@/lib/academy';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);

  return (
    <>
      <h1 className="h1">Ρυθμίσεις</h1>
      <p className="sub">Ο λογαριασμός σου, όπως τον ξέρει η πλατφόρμα.</p>

      <div className="card2" style={{ marginTop: 22, maxWidth: 560 }}>
        <dl className="kv">
          <dt>Όνομα</dt><dd>{s.name}</dd>
          <dt>Telegram</dt><dd>{s.username ? '@' + s.username : `#${s.tid}`}</dd>
          <dt>Ρόλος</dt><dd>{v.admin ? 'Διαχειριστής' : 'Μέλος'}</dd>
          <dt>Πακέτα</dt><dd>{[...v.tiers].join(' · ')}</dd>
        </dl>
      </div>

      <p className="meta" style={{ marginTop: 14, maxWidth: '58ch', lineHeight: 1.6 }}>
        Η σύνδεση γίνεται με Telegram και δεν υπάρχει κωδικός να αλλάξεις. Αν θες
        να αποσυνδεθείς από όλες τις συσκευές, πες μας και αλλάζουμε το μυστικό
        της πλατφόρμας.
      </p>
    </>
  );
}
