import { currentLang } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default function JournalPage() {
  const url = process.env.NEXT_PUBLIC_JOURNAL_URL ?? 'https://ultimatradingjournal.com';
  const en = currentLang() === 'en';
  return (
    <>
      <h1 className="h1">Trading Journal</h1>
      <p className="sub">{en ? 'It opens right here. Everything you log stays in your Journal account.' : 'Ανοίγει εδώ μέσα. Ό,τι καταγράφεις μένει στον λογαριασμό σου στο Journal.'}</p>
      <div className="frame-embed">
        <iframe src={url} title="Ultimate Trading Journal" />
      </div>
      <p className="meta" style={{ marginTop: 10 }}>
        {en ? 'If something doesn’t load, ' : 'Αν κάτι δεν φορτώνει, '}
        <a href={url} target="_blank" rel="noopener">{en ? 'open it in its own tab' : 'άνοιξέ το σε δική του καρτέλα'}</a>.
      </p>
    </>
  );
}
