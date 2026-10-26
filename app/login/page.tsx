import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import TelegramLogin from '@/components/TelegramLogin';
import { currentSession } from '@/lib/session';
import { currentLang } from '@/lib/lang';
import type { Lang } from '@/lib/i18n';
import LangSwitch from '@/components/LangSwitch';

export const dynamic = 'force-dynamic';
export function generateMetadata(): Metadata {
  return {
    title: currentLang() === 'en' ? 'Log in — APEXHUB' : 'Σύνδεση — APEXHUB',
    robots: { index: false, follow: false },
  };
}

const T = {
  el: {
    nmH: 'Δεν σε βρήκαμε στην κοινότητα.',
    nmP1: 'Η πλατφόρμα είναι ανοιχτή μόνο σε όσους είναι ήδη μέλη του APEXHUB VIP στο Telegram. Αν μόλις μπήκες, δοκίμασε ξανά σε ένα λεπτό.',
    nmP2: 'Αν δεν είσαι ακόμη μέλος, ξεκίνα από το ανοιχτό μας κανάλι — από εκεί ανακοινώνεται πότε ανοίγουν θέσεις.',
    openTg: 'Άνοιγμα στο Telegram',
    h1: 'Είσοδος μελών',
    lede: 'Η σύνδεση γίνεται με τον λογαριασμό Telegram σου. Δεν υπάρχει κωδικός να θυμάσαι — αν είσαι μέσα στην κοινότητα, περνάς.',
    noBot: 'Η σύνδεση δεν είναι ακόμη ρυθμισμένη. Λείπει το NEXT_PUBLIC_BOT_USERNAME.',
    note: 'Δεν δημοσιεύουμε τίποτα στο Telegram σου και δεν βλέπουμε τις συνομιλίες σου. Μαθαίνουμε μόνο ποιος είσαι και ότι ανήκεις στην κοινότητα.',
    back: '← Πίσω στην αρχική',
  },
  en: {
    nmH: 'We couldn’t find you in the community.',
    nmP1: 'The platform is open only to existing members of APEXHUB VIP on Telegram. If you just joined, try again in a minute.',
    nmP2: 'If you are not a member yet, start from our open channel — that is where we announce when places open.',
    openTg: 'Open in Telegram',
    h1: 'Members’ login',
    lede: 'You log in with your Telegram account. There is no password to remember — if you are in the community, you are in.',
    noBot: 'Login is not configured yet. NEXT_PUBLIC_BOT_USERNAME is missing.',
    note: 'We never post anything on your Telegram and we cannot see your chats. We only learn who you are and that you belong to the community.',
    back: '← Back to home',
  },
};

/* Τα μηνύματα σφάλματος έρχονται από τον server ως ελληνικό κείμενο στο
   `?error=`. Στα αγγλικά τα αντιστοιχίζουμε εδώ· ό,τι άγνωστο δείχνεται όπως ήρθε. */
const ERR_EN: Record<string, string> = {
  'Λείπει το TELEGRAM_BOT_TOKEN.': 'TELEGRAM_BOT_TOKEN is missing.',
  'Λείπει η υπογραφή.': 'The signature is missing.',
  'Ελλιπή στοιχεία.': 'Incomplete login data.',
  'Η σύνδεση έληξε. Δοκίμασε ξανά.': 'The login expired. Try again.',
  'Μη έγκυρη χρονοσήμανση.': 'Invalid timestamp.',
  'Μη έγκυρη υπογραφή.': 'Invalid signature.',
  'Λείπει ρύθμιση Telegram.': 'Telegram is not configured.',
  'Δεν ήταν δυνατή η επικοινωνία με το Telegram.': 'Could not reach Telegram.',
  'Το Telegram δεν απάντησε.': 'Telegram did not respond.',
  'Δεν μπορέσαμε να επιβεβαιώσουμε τη συμμετοχή σου. Δοκίμασε ξανά σε λίγο.':
    'We could not confirm your membership. Try again shortly.',
};

/** Το «not_member» είναι δικό μας σήμα, όχι μήνυμα — αξίζει δική του εξήγηση. */
function Explain({ error, lang }: { error?: string; lang: Lang }) {
  const t = T[lang];
  if (!error) return null;

  if (error === 'not_member') {
    return (
      <div className="gate">
        <h2>{t.nmH}</h2>
        <p>{t.nmP1}</p>
        <p>{t.nmP2}</p>
        <a className="btn btn-solid" href="https://t.me/ApexHubChannel"
           target="_blank" rel="noopener">{t.openTg}</a>
      </div>
    );
  }

  return <div className="gate"><p>{lang === 'en' ? (ERR_EN[error] ?? error) : error}</p></div>;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  if (currentSession()) redirect('/members');

  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME ?? '';
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apexhub.gr';
  const lang = currentLang();
  const t = T[lang];

  return (
    <main className="wrap auth">
      <LangSwitch lang={lang} />
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

      <h1>{t.h1}</h1>
      <p className="lede">{t.lede}</p>

      <Explain error={searchParams.error} lang={lang} />

      {bot ? (
        <div className="tgbox">
          <TelegramLogin bot={bot} authUrl={`${site}/api/auth/telegram`} lang={lang} />
        </div>
      ) : (
        <div className="gate">
          <p>{t.noBot}</p>
        </div>
      )}

      <p className="note">{t.note}</p>

      <a className="back" href="/">{t.back}</a>
    </main>
  );
}
