import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf } from '@/lib/academy';
import { currentLang } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const en = currentLang() === 'en';

  return (
    <>
      <h1 className="h1">{en ? 'Settings' : 'Ρυθμίσεις'}</h1>
      <p className="sub">{en ? 'Your account, as the platform knows it.' : 'Ο λογαριασμός σου, όπως τον ξέρει η πλατφόρμα.'}</p>

      <div className="card2" style={{ marginTop: 22, maxWidth: 560 }}>
        <dl className="kv">
          <dt>{en ? 'Name' : 'Όνομα'}</dt><dd>{s.name}</dd>
          <dt>Telegram</dt><dd>{s.username ? '@' + s.username : `#${s.tid}`}</dd>
          <dt>{en ? 'Role' : 'Ρόλος'}</dt><dd>{v.admin ? (en ? 'Administrator' : 'Διαχειριστής') : (en ? 'Member' : 'Μέλος')}</dd>
          <dt>{en ? 'Packages' : 'Πακέτα'}</dt><dd>{[...v.tiers].join(' · ')}</dd>
        </dl>
      </div>

      <p className="meta" style={{ marginTop: 14, maxWidth: '58ch', lineHeight: 1.6 }}>
        {en
          ? 'You log in with Telegram, so there is no password to change. If you want to be logged out of all devices, tell us and we will rotate the platform secret.'
          : 'Η σύνδεση γίνεται με Telegram και δεν υπάρχει κωδικός να αλλάξεις. Αν θες να αποσυνδεθείς από όλες τις συσκευές, πες μας και αλλάζουμε το μυστικό της πλατφόρμας.'}
      </p>
    </>
  );
}
