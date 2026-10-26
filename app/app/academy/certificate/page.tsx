import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf } from '@/lib/academy';
import { certificate } from '@/lib/quiz';
import PrintButton from '@/components/PrintButton';
import { ILock } from '@/components/Icons';
import { currentLang } from '@/lib/lang';
import { LOCALE } from '@/lib/i18n';

const T = {
  el: {
    eb: 'Πιστοποιητικο', notYet: 'Δεν έχει εκδοθεί ακόμη', withOverall: 'Το πιστοποιητικό βγαίνει με το ολικό τεστ.',
    opens: 'Ανοίγει όταν περάσεις και τα πέντε τελικά τεστ: Αρχάριος, Μεσαίος, Προχωρημένος, Ψυχολογία και Νοοτροπία.',
    back: 'Πίσω στην Ακαδημία', done: 'Το ολοκλήρωσες',
    passed: (s: number, t: number) => `Πέρασες το ολικό τεστ με ${s} σωστές από ${t}. Το χαρτί είναι από κάτω — τύπωσέ το ή κράτα το PDF.`,
    kind: 'Πιστοποιητικό ολοκλήρωσης',
    body1: 'ολοκλήρωσε το σύνολο της ύλης της', body2: (s: number, t: number) => `— ενενήντα οκτώ μαθήματα σε τρία επίπεδα, μαζί με την Ψυχολογία και τη Νοοτροπία του trader — και απάντησε σωστά σε ${s} από τις ${t} ερωτήσεις του ολικού τεστ.`,
    pct: 'Ποσοστό', date: 'Ημερομηνία',
    fine: 'Αναμνηστικό ολοκλήρωσης της ApexHub Academy. Δεν αποτελεί αναγνωρισμένο τίτλο σπουδών ούτε πιστοποίηση επαγγελματικής επάρκειας.',
    dl: 'Κατέβασέ το', admin: 'Το βλέπεις ως διαχειριστής· το περιεχόμενο είναι η δική σου περασμένη προσπάθεια.',
  },
  en: {
    eb: 'Certificate', notYet: 'Not issued yet', withOverall: 'The certificate comes with the overall test.',
    opens: 'It opens when you pass all five final tests: Beginner, Intermediate, Advanced, Psychology and Mindset.',
    back: 'Back to the Academy', done: 'You completed it',
    passed: (s: number, t: number) => `You passed the overall test with ${s} correct out of ${t}. The certificate is below — print it or keep the PDF.`,
    kind: 'Certificate of completion',
    body1: 'has completed the entire syllabus of the', body2: (s: number, t: number) => `— ninety-eight lessons across three levels, together with the trader’s Psychology and Mindset — and answered ${s} of the ${t} questions of the overall test correctly.`,
    pct: 'Score', date: 'Date',
    fine: 'A commemorative certificate of completion of the ApexHub Academy. It is not a recognised academic qualification or a certification of professional competence.',
    dl: 'Download it', admin: 'You are viewing this as an administrator; the content is your own passed attempt.',
  },
};

export const dynamic = 'force-dynamic';

/**
 * Το πιστοποιητικό ολοκλήρωσης.
 *
 * ΔΕΝ ΕΙΝΑΙ ΑΝΑΓΝΩΡΙΣΜΕΝΟΣ ΤΙΤΛΟΣ ΣΠΟΥΔΩΝ, ΚΑΙ ΤΟ ΛΕΕΙ ΤΟ ΙΔΙΟ. Η ApexHub
 * δεν είναι εκπαιδευτικό ίδρυμα· το χαρτί βεβαιώνει ότι κάποιος πέρασε από
 * όλη την ύλη και απάντησε σωστά στο ολικό τεστ, τίποτα παραπάνω. Μια τέτοια
 * γραμμή πάνω στο ίδιο το χαρτί κοστίζει μηδέν και γλιτώνει παρεξηγήσεις.
 *
 * ΦΤΙΑΧΝΕΤΑΙ ΤΗ ΣΤΙΓΜΗ ΠΟΥ ΤΟ ΖΗΤΑΣ, ΑΠΟ ΤΗ ΒΑΣΗ. Δεν αποθηκεύεται αρχείο
 * πουθενά: η μόνη πηγή είναι η περασμένη προσπάθεια στο ολικό τεστ. Αν δεν
 * υπάρχει, δεν υπάρχει και πιστοποιητικό — ούτε με απευθείας διεύθυνση.
 */
export default async function CertificatePage() {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const cert = await certificate(s.tid);
  const lang = currentLang();
  const t = T[lang];

  if (!cert) {
    return (
      <>
        <header className="hero">
          <span className="eyebrow">{t.eb}</span>
          <h1 className="h1" style={{ marginTop: 14 }}>{t.notYet}</h1>
        </header>
        <div className="gate2" style={{ marginTop: 30 }}>
          <span className="gate2-ic"><ILock /></span>
          <b>{t.withOverall}</b>
          <p>{t.opens}</p>
          <Link className="gold-btn" href="/app/academy">{t.back}</Link>
        </div>
      </>
    );
  }

  const date = new Date(cert.at).toLocaleDateString(LOCALE[lang], {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <header className="hero noprint">
        <span className="eyebrow">{t.eb}</span>
        <h1 className="h1" style={{ marginTop: 14 }}>{t.done}</h1>
        <p className="sub">{t.passed(cert.score, cert.total)}</p>
      </header>

      <div className="cert">
        <div className="cert-in">
          <span className="cert-mark">ApexHub</span>
          <span className="cert-kind">{t.kind}</span>

          <b className="cert-name">{s.name}</b>

          <p className="cert-body">
            {t.body1} <b>ApexHub Academy</b> {t.body2(cert.score, cert.total)}
          </p>

          <div className="cert-foot">
            <span><em>{t.pct}</em><b className="num">{cert.pct}%</b></span>
            <span><em>{t.date}</em><b>{date}</b></span>
          </div>

          <p className="cert-fine">
            {t.fine}
          </p>
        </div>
      </div>

      <div className="cert-acts noprint">
        <PrintButton label={t.dl} />
        <Link className="btn btn-line" href="/app/academy">{t.back}</Link>
      </div>

      {v.admin && (
        <p className="meta noprint" style={{ marginTop: 18 }}>
          {t.admin}
        </p>
      )}
    </>
  );
}
