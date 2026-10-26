import { currentLang } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default function BackofficePage() {
  const url = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://portal.apexhub.gr';
  const en = currentLang() === 'en';
  return (
    <>
      <h1 className="h1">Back office</h1>
      <p className="sub">
        {en
          ? 'Commissions, team and payouts. It has its own login with your partner account.'
          : 'Προμήθειες, ομάδα και πληρωμές. Έχει δική του σύνδεση με τον λογαριασμό συνεργάτη σου.'}
      </p>
      <div className="frame-embed">
        <iframe src={url} title="Back office" />
      </div>
      <p className="meta" style={{ marginTop: 10 }}>
        <a href={url} target="_blank" rel="noopener">{en ? 'Open in its own tab' : 'Άνοιγμα σε δική του καρτέλα'}</a>
      </p>
    </>
  );
}
