import { ISend } from '@/components/Icons';
import { currentLang } from '@/lib/lang';

export const dynamic = 'force-dynamic';

/**
 * Το Telegram δεν ενσωματώνεται σε iframe — το μπλοκάρει το ίδιο. Αντί να
 * δείξουμε ένα κενό κάδρο, λέμε τι θα γίνει και ανοίγουμε την εφαρμογή.
 */
export default function TelegramPage() {
  const en = currentLang() === 'en';
  return (
    <>
      <h1 className="h1">Telegram</h1>
      <p className="sub">{en ? 'The daily conversation, the trading ideas and the live sessions.' : 'Η καθημερινή συζήτηση, τα trading ideas και τα live sessions.'}</p>
      <div className="card2" style={{ marginTop: 22, maxWidth: 520 }}>
        <p style={{ color: 'var(--fg2)', fontSize: 14.5 }}>
          {en
            ? 'Telegram cannot be embedded inside another page. The button opens your app.'
            : 'Το Telegram δεν επιτρέπει να ενσωματωθεί μέσα σε άλλη σελίδα. Το κουμπί ανοίγει την εφαρμογή σου.'}
        </p>
        <a className="btn btn-solid" style={{ marginTop: 16 }}
           href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">
          <ISend /> {en ? 'Open Telegram' : 'Άνοιγμα Telegram'}
        </a>
      </div>
    </>
  );
}
