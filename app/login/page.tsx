import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import TelegramLogin from '@/components/TelegramLogin';
import { currentSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Σύνδεση — APEXHUB',
  robots: { index: false, follow: false },
};

/** Το «not_member» είναι δικό μας σήμα, όχι μήνυμα — αξίζει δική του εξήγηση. */
function Explain({ error }: { error?: string }) {
  if (!error) return null;

  if (error === 'not_member') {
    return (
      <div className="gate">
        <h2>Δεν σε βρήκαμε στην κοινότητα.</h2>
        <p>
          Η πλατφόρμα είναι ανοιχτή μόνο σε όσους είναι ήδη μέλη του APEXHUB VIP
          στο Telegram. Αν μόλις μπήκες, δοκίμασε ξανά σε ένα λεπτό.
        </p>
        <p>
          Αν δεν είσαι ακόμη μέλος, ξεκίνα από το ανοιχτό μας κανάλι — από εκεί
          ανακοινώνεται πότε ανοίγουν θέσεις.
        </p>
        <a className="btn btn-solid" href="https://t.me/ApexHubChannel"
           target="_blank" rel="noopener">Άνοιγμα στο Telegram</a>
      </div>
    );
  }

  return <div className="gate"><p>{error}</p></div>;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  if (currentSession()) redirect('/members');

  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME ?? '';
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apexhub.gr';

  return (
    <main className="wrap auth">
      <a className="mark" href="/" aria-label="ApexHub">
        <svg viewBox="0 0 104 100" aria-hidden>
          <defs>
            <linearGradient id="gll" x1=".1" y1="0" x2=".9" y2="1">
              <stop offset="0" stopColor="#FBEFC6" /><stop offset=".55" stopColor="#EBC862" />
              <stop offset="1" stopColor="#C9A043" />
            </linearGradient>
            <linearGradient id="gdl" x1=".1" y1="0" x2="1" y2=".9">
              <stop offset="0" stopColor="#B98F32" /><stop offset=".6" stopColor="#8F6D22" />
              <stop offset="1" stopColor="#6E5319" />
            </linearGradient>
          </defs>
          <path fill="url(#gll)" d="M52 3 100 97H76L52 45Z" />
          <path fill="url(#gdl)" d="M52 3 52 45 28 97H4Z" />
          <path fill="url(#gll)" d="M38 68h28l7 14H31Z" opacity=".92" />
        </svg>
        <span className="lock">
          <span className="wm">Apex<i>Hub</i></span>
          <span className="tc">Trading Community</span>
        </span>
      </a>

      <h1>Είσοδος μελών</h1>
      <p className="lede">
        Η σύνδεση γίνεται με τον λογαριασμό Telegram σου. Δεν υπάρχει κωδικός να
        θυμάσαι — αν είσαι μέσα στην κοινότητα, περνάς.
      </p>

      <Explain error={searchParams.error} />

      {bot ? (
        <div className="tgbox">
          <TelegramLogin bot={bot} authUrl={`${site}/api/auth/telegram`} />
        </div>
      ) : (
        <div className="gate">
          <p>Η σύνδεση δεν είναι ακόμη ρυθμισμένη. Λείπει το NEXT_PUBLIC_BOT_USERNAME.</p>
        </div>
      )}

      <p className="note">
        Δεν δημοσιεύουμε τίποτα στο Telegram σου και δεν βλέπουμε τις συνομιλίες
        σου. Μαθαίνουμε μόνο ποιος είσαι και ότι ανήκεις στην κοινότητα.
      </p>

      <a className="back" href="/">← Πίσω στην αρχική</a>
    </main>
  );
}
