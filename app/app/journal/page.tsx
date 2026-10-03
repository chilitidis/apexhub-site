export const dynamic = 'force-dynamic';

export default function JournalPage() {
  const url = process.env.NEXT_PUBLIC_JOURNAL_URL ?? 'https://ultimatradingjournal.com';
  return (
    <>
      <h1 className="h1">Trading Journal</h1>
      <p className="sub">Ανοίγει εδώ μέσα. Ό,τι καταγράφεις μένει στον λογαριασμό σου στο Journal.</p>
      <div className="frame-embed">
        <iframe src={url} title="Ultimate Trading Journal" />
      </div>
      <p className="meta" style={{ marginTop: 10 }}>
        Αν κάτι δεν φορτώνει, <a href={url} target="_blank" rel="noopener">άνοιξέ το σε δική του καρτέλα</a>.
      </p>
    </>
  );
}
